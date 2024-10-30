// 组件 provide 和 inject 功能
import { h } from '../../lib/guide-mini-vue.esm.js';
window.self = null;
const App = {
  render() {
    window.self = this;
    console.log(this.$el);
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'hard']
      },
      'hi, ' + this.msg
    );
  },

  setup() {
    return {
      msg: 'mini-vue-haha'
    };
  }
};

export default App;
