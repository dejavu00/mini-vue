import { extend } from '../shared';

const targetMap = new Map();
let activeEffect: ReactiveEffect;
let shouldTrack;
export class ReactiveEffect {
  private _fn: () => void;
  public scheduler: Function | undefined;
  depsList = [];
  active = true;
  onStop?: () => void;
  constructor(fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    // 1、会收集依赖
    // shouldTrack 来做区分
    // TODO: 不理解
    if (!this.active) {
      return this._fn();
    }
    shouldTrack = true;
    activeEffect = this;
    // 这里执行触发收集依赖，track
    const result = this._fn();
    shouldTrack = false;
    return result;
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
      if (this.onStop) {
        this.onStop();
      }
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  extend(_effect, options);
  // extend
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

// 将effect从dep中删除掉
export function stop(runner) {
  runner.effect.stop();
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function track(target, key) {
  if (!isTracking()) return;
  // target - key - dep
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }

  trackEffects(deps);
}

export function trackEffects(deps) {
  if (deps.has(activeEffect)) return;
  deps.add(activeEffect);
  //@ts-ignore
  activeEffect.depsList.push(deps);
}

export function triggerEffects(deps) {
  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const deps = depsMap.get(key);
  triggerEffects(deps);
}
// TODO: 不理解
function cleanupEffect(effect) {
  effect.depsList.forEach((deps: any) => {
    // 将所有的fn删除掉
    deps.delete(effect);
  });
}
