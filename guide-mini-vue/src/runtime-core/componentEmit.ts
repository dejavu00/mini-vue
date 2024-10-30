export function emit(instance, event, ...args) {
  // 通过bind必报实现instance
  const { props } = instance;
  // TPP
  // 先去写一个特定的行为- 重构成通用的行为
  // add ->Add
  // add -foo -addFoo

  const camelize = str => {
    return str.replace(/-(\w)/g, (_, c: string) => {
      return c ? c.toUpperCase() : '';
    });
  };
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const toHandleKey = (str: string) => {
    return str ? 'on' + capitalize(str) : '';
  };
  const handler = props[toHandleKey(camelize(event))];
  handler && handler(...args);
}
