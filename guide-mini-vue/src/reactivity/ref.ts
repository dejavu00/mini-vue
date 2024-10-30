import { hasChanged, isObject } from './../shared/index';
import { trackEffects, triggerEffects, isTracking } from './effect';
import { reactive } from './reactive';

// 1 ture '1'\
// proxy 针对普通值无用
// 利用类的get set特性，模拟proxy依赖收集执行
class RefImpl {
  private _value: any;
  public deps;
  private _rawValue: any;
  public __v_isRef = true;
  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    this.deps = new Set();
    // 1 看看vlaue是不是对象
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    // 对比的时候
    if (!hasChanged(this._rawValue, newValue)) return;
    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffects(this.deps);
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.deps);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}
export function unref(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unref(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    }
  });
}
