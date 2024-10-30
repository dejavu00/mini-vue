import { ShapeFlags } from "./ShapeFlags";

export const extend = Object.assign;

export const isObject = val => {
  return val !== null && typeof val === 'object';
};
export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue);
};

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);



export const getShapeFlag = (type) => {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
