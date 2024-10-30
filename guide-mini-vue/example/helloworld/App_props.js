// 组件 provide 和 inject 功能
import { h } from '../../lib/guide-mini-vue.esm.js';

const Foo = {
  setup(props) {
    console.log(props);
    // readonly
    // props.count++;
  },
  render() {
    return h('div', {}, 'foo:' + this.count);
  }
};

const App = {
  setup() {
    return {
      msg: 'app_props'
    };
  },
  render() {
    return h('div', {}, [
      h('div', {}, 'hi,' + this.msg),
      h(Foo, {
        count: 1
      })
    ]);
  }
};

export default App;
