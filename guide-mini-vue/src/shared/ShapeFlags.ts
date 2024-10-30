// 组件的类型
// 标识组件，标识children
export const enum ShapeFlags {
    // 最后要渲染的 element 类型
    ELEMENT = 1, // 0001
    // 组件类型
    STATEFUL_COMPONENT = 1 << 2,
    // vnode 的 children 为 string 类型  1* 2* 2 = 0100
    TEXT_CHILDREN = 1 << 3,
    // vnode 的 children 为数组类型 1* 2* 2*2= 1000
    ARRAY_CHILDREN = 1 << 4,
    // vnode 的 children 为 slots 类型 1* 2* 2*2*2= 10000
    SLOTS_CHILDREN = 1 << 5  // 1* 2* 2*2*2*2= 100000
}
