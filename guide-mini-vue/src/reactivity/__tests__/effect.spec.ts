import { reactive } from '../reactive';
import { effect, stop } from '../effect';

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    });
    let nextAge = 10;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);
    // update
    user.age++;
    expect(nextAge).toBe(12);
  });

  it('should return runner when call effect', () => {
    // 1. effect(fn ) -> function(runner) -> fn -> return
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return 'foo';
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe('foo');
  });

  it('scheduler', () => {
    // 1.通过effect的第二个参数给定一个scheduler的fn
    // 2effect第一次执行还会执行fn
    // 3 当响应式对象set  update不会执行fn， 而是执行scheduler
    // 4 如果当执行runner的时候，会再次执行fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        scheduler
      }
    );

    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1);
    // manually run
    run();
    expect(dummy).toBe(2);
  });

  it('stop', () => {
    let dummy;
    const obj = reactive({
      prop: 1
    });
    const runner = effect(() => {
      dummy = obj.prop;
    });

    obj.prop = 2;
    stop(runner);
    // obj.prop = 3;
    obj.prop++;
    expect(dummy).toBe(2);
    // stopped effect should still be manually callable
    runner();
    expect(dummy).toBe(3);
  });

  it('onStop', () => {
    const obj = reactive({
      prop: 1
    });
    const onStop = jest.fn();
    let dummy;

    const runner = effect(
      () => {
        dummy = obj.prop;
      },
      {
        onStop
      }
    );

    stop(runner);
    obj.prop = 3;
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
