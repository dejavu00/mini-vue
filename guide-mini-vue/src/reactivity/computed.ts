import { ReactiveEffect } from './effect';
class ComputedRefImpl {
  private _getter: any;
  private _value: any;
  private _effect: any;
  private _dirty = true;
  constructor(getter) {
    this._getter = getter;
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    // 依赖的响应式对象值发生改变时候 get value -> dirty true
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
      return this._value;
    }
    return this._value;
  }
}
export function computed(getter) {
  return new ComputedRefImpl(getter);
}
