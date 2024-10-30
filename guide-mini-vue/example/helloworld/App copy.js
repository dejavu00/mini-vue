// 组件 provide 和 inject 功能
import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js';
const ProviderOne = {
  setup() {
    provide('foo', 'fooVal');
    provide('bar', 'barVal');
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(Consumer)]);
  }
};

const Consumer = {
  setup() {
    const foo = inject('foo');
    const bar = inject('bar');
    return {};
  },
  render() {
    return h('div', {}, `${this.foo}-${this.bar}`);
  }
};

export default {
  name: 'App',
  setup() {
    return {};
  },
  render() {
    return h('div', {}, [h('p', {}, 'apiInject'), h(ProviderOne)]);
  }
};
