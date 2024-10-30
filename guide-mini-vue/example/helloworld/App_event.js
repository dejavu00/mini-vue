// 组件 provide 和 inject 功能
import { h } from '../../lib/guide-mini-vue.esm.js';
const App = {
  render() {
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'hard'],
        onClick() {
          console.log('click');
        }
      },
      'hi, mini-vue'
    );
  },

  setup() {
    return {};
  }
};

export default App;
