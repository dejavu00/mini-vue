import { shallowReadonly } from '../reactivity/reactive';
import { initProps } from './componentProps';
import { initSlots } from './componentSlots';
import { PublishInstanceProxyHandlers } from './componentPublicInstance';
import { emit } from './componentEmit'
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    provides: {},
    slots: {},
    emit: () => null
  };
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance) {
  // todo
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)

  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
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



  instance.proxy = new Proxy(
    {
      _: instance
    },
    PublishInstanceProxyHandlers
  );

  if (setup) {
    // 设置当前 currentInstance 的值
    // 必须要在调用 setup 之前
    setCurrentInstance(instance);


    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    });
    //  const setupResult = setup(instance.props);
    // 这里组件打印的组件props，在initProps获取的instance.vnode.props，也就是createVnode中的props
    // App_props.js中h(Foo, { 生成的vnode里面的props
    //   count: 1
    // })


    setCurrentInstance(null);

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  // function Object 
  // todo function

  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}




let currentInstance = {};
// 这个接口暴露给用户，用户可以在 setup 中获取组件实例 instance
export function getCurrentInstance(): any {
  return currentInstance;
}

export function setCurrentInstance(instance) {
  currentInstance = instance;
}
