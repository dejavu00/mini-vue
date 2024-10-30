import { ShapeFlags } from "../shared/ShapeFlags";
// type html标签或者是{render, setup} 
// vnode是包含type上多了一些 h第二个参数的属性， children， el等
export function createVnode(type, props?, children?) {
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
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }







  return vnode;
}

function getShapeFlag(type) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
