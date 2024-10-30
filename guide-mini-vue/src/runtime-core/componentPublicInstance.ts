import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
  $el: i => i.vnode.el,
  $slots: (i) => i.slots
};

export const PublishInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // setupState是steup函数执行之后返回的对象
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      // props属性需要通过this.xx访问到
      return props[key];
    }

    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  }
};


