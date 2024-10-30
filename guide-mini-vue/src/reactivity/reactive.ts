import { isObject } from '../shared/index';
import {
  mutableHandler,
  readOnlyHandler,
  shallowReadOnlyHandler
} from './baseHandlers';

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandler);
}

export function readonly(raw) {
  return createActiveObject(raw, readOnlyHandler);
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadOnlyHandler);
}

function createActiveObject(raw: any, baseHandlers) {
  if(!isObject(raw)) {
    throw new Error('代理元素必须是个对象')
  }
  return new Proxy(raw, baseHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}
export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
