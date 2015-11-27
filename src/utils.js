export function evaluate1(cb) {
  cb(this);
}
export function evaluate2(cb) {
  cb(this[0], this[1]);
}
export function pushB(a, b) {
  this.push(b);
}

export function copy(array) {
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

let pushIndex;
function push1(item) {
  this[++pushIndex] = item;
}
export function any(arrays) {
  const out = new Set(), len = arrays.length;
  for(let i = 0; i < len; ++i) {
    const arr = arrays[i], len = arr.length;
    for(let j = 0; j < len; ++j) {
      out.add(arr[j]);
    }
  }
  pushIndex = -1;
  out.forEach(push1, arrays[0]);
  return arrays[0];
}

export function andNot(yes, no) {
  for(let i = yes.length; i > 0;) {
    if(no.indexOf(yes[--i]) !== -1) {
      yes.splice(i, 1);
    }
  }
  return yes;
}
