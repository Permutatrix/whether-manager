export function clone(array) {
  const len = array.length, out = Array(len);
  for(let i = 0; i < len; ++i) {
    out[i] = array[i];
  }
  return out;
}

export function merge() {
  const out = {}, len = arguments.length;
  for(let i = 0; i < len; ++i) {
    const obj = arguments[i];
    for(let key in obj) {
      out[key] = obj[key];
    }
  }
  return out;
}

export function all(arrays) {
  const out = arrays[0], len = arrays.length;
  for(let i = out.length; i > 0;) {
    const v = out[--i];
    for(let j = 1; j < len; ++j) {
      if(arrays[j].indexOf(v) === -1) {
        out.splice(i, 1);
        break;
      }
    }
  }
  return out;
}
