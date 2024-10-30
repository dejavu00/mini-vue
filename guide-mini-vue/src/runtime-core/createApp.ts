import { render } from './renderer';
import { createVnode } from './vnode'
export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先vnode
            // component -> vnode
            // 所有的逻辑操作都会基于vnode 做处理
            const vnode = createVnode(rootComponent)
            render(vnode, rootContainer);
        },
    }
}

