export default
  typeof WeakMap !== 'undefined' ?
    new WeakMap() :
    {
      get(key) {
        return key.__secret__;
      },
      set(key, value) {
        key.__secret__ = value;
      }
    };
