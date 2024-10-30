import { trigger, track } from './effect';
import { reactive, ReactiveFlags, readonly } from './reactive';
import { extend, isObject } from '../shared/index';

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);

    if (shallow) {
      return res;
    }

    // 看看res是不是object
    if (isObject(res)) {
      // 递归处理里面的对象，只读的或者需要响应的
      return isReadonly ? readonly(res) : reactive(res);
    }
    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

export const mutableHandler = {
  get,
  set
};
export const readOnlyHandler = {
  get: readonlyGet,
  set(target, key, value) {
    console.error(`key: ${key} set 失败， 因为target是readonly`, target);
    return true;
  }
};

export const shallowReadOnlyHandler = extend({}, readOnlyHandler, {
  get: shallowReadonlyGet
});
