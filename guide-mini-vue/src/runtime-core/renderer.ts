import { ShapeFlags } from '../shared/ShapeFlags';
import { createComponentInstance, setupComponent } from './component';

export function render(vnode, container) {
  // patch
  //
  patch(vnode, container);
}

function patch(vnode, container) {
  // vnode通过createVnode创建时，ShapeFlags类型和children都已经定义，比如0110 & 0100,只有都存在才能为1，所以这里可以用&
  const { shapeFlag } = vnode
  // 判断是不是 dom标签
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const { type, children, props, shapeFlag } = vnode;
  const el = (vnode.el = document.createElement(type));


  // 位元素相与
  // children 是纯文本了 
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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
    } else {
      el.setAttribute(key, val);
    }
  }
  container.appendChild(el);
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initialVNode: any, container: any) {
  const instance = createComponentInstance(initialVNode);
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode: any, container: any) {
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
