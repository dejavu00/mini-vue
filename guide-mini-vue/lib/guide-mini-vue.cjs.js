'use strict';

const extend = Object.assign;
const isObject = val => {
    return val !== null && typeof val === 'object';
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

const targetMap = new Map();
function triggerEffects(deps) {
    for (const effect of deps) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    triggerEffects(deps);
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 看看res是不是object
        if (isObject(res)) {
            // 递归处理里面的对象，只读的或者需要响应的
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandler = {
    get,
    set
};
const readOnlyHandler = {
    get: readonlyGet,
    set(target, key, value) {
        console.error(`key: ${key} set 失败， 因为target是readonly`, target);
        return true;
    }
};
const shallowReadOnlyHandler = extend({}, readOnlyHandler, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandler);
}
function readonly(raw) {
    return createActiveObject(raw, readOnlyHandler);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadOnlyHandler);
}
function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        throw new Error('代理元素必须是个对象');
    }
    return new Proxy(raw, baseHandlers);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

function initSlots(instance, children) {
    instance.slots = Array.isArray(children) ? children : [children];
}

const publicPropertiesMap = {
    $el: i => i.vnode.el,
    $slots: (i) => i.slots
};
const PublishInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupState是steup函数执行之后返回的对象
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            // props属性需要通过this.xx访问到
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function emit(instance, event, ...args) {
    // 通过bind必报实现instance
    const { props } = instance;
    // TPP
    // 先去写一个特定的行为- 重构成通用的行为
    // add ->Add
    // add -foo -addFoo
    const camelize = str => {
        return str.replace(/-(\w)/g, (_, c) => {
            return c ? c.toUpperCase() : '';
        });
    };
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    const toHandleKey = (str) => {
        return str ? 'on' + capitalize(str) : '';
    };
    const handler = props[toHandleKey(camelize(event))];
    handler && handler(...args);
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        provides: {},
        slots: {},
        emit: () => null
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // todo
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    //    _: instance为什么这样写
    // 最开始写法，提取PublishInstanceProxyHandlers需要知道instance，
    // 所以通过__来传递instance，target就解析成{_: instance}
    // instance.proxy = new Proxy({},
    //   {
    //     get(target, key) {
    //       const { steupState } = instance
    //       if (key in steupState) {
    //         return steupState[key]
    //       }
    //       if (key === '$el') {
    //         return instance.vnode.el
    //       }
    //     }
    //   }
    // )
    instance.proxy = new Proxy({
        _: instance
    }, PublishInstanceProxyHandlers);
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object 
    // todo function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    // patch
    //
    patch(vnode, container);
}
function patch(vnode, container) {
    // vnode通过createVnode创建时，ShapeFlags类型和children都已经定义，比如0110 & 0100,只有都存在才能为1，所以这里可以用&
    const { shapeFlag } = vnode;
    // 判断是不是 dom标签
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
// 这里的container已经变成了父级的dom了
// children里面遍历完成加入到父组件了了，最后才是root组件的 container.appendChild(el);
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container);
    });
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, children, props, shapeFlag } = vnode;
    const el = (vnode.el = document.createElement(type));
    // 位元素相与
    // children 是纯文本了 
    if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    for (const key in props) {
        const val = props[key];
        // 具体click -> 通用
        // on + Event name
        const isOn = key => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.appendChild(el);
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    // 改变this指向，保证render里面的this.$el, this.$data都是访问的proxy,getter中，也就是steupState的值了
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    // 所有的element挂载完毕
    // vnode
    // vnode -> element - > mountElement
    // subTree:  h('div', 'hi, ' + this.msg);
    // 已经是h('div', 'hi, ' + this.msg);生成的vnode了，所以内部vnode.el= document.createElement('div')和这里的组件el根本没有关系，所以要想在组件势例中访问到this.$el,也就是组件的vnode.el,这里需要赋值
    // initialVNode 这个是组件实例，不是element，赋值后，让render函数中的this.$el指向这个element的root
    initialVNode.el = subTree.el;
}

// type html标签或者是{render, setup} 
// vnode是包含type上多了一些 h第二个参数的属性， children， el等
function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        // 这里根据type也就是h(tag)中tag，判断是组件还是dom元素 0001 和 0100
        shapeFlag: getShapeFlag(type),
    };
    // 根据children再次赋值shapeflag
    if (typeof children === 'string') {
        vnode.shapeFlag |= 8 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 16 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 4 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先vnode
            // component -> vnode
            // 所有的逻辑操作都会基于vnode 做处理
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots) {
    return createVnode('div', {}, slots);
}

exports.createApp = createApp;
exports.h = h;
exports.renderSlots = renderSlots;
