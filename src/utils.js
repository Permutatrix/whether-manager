export function pushB(a, b) {
  this.push(b);
}

export function executeAll(array, arg) {
  for(let i = 0, len = array.length; i < len; ++i) {
    array[i](arg);
  }
}

export function copy(array) {
  const len = array.length, out = Array(len);
  for(let i = 0; i < len; ++i) {
    out[i] = array[i];
  }
  return out;
}

export function remove(array, item) {
  const index = array.indexOf(item);
  if(index !== -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

export function merge() {
  const out = {};
  for(let i = 0, len = arguments.length; i < len; ++i) {
    const obj = arguments[i], keys = Object.keys(obj);
    for(let i = 0, len = keys.length; i < len; ++i) {
      out[keys[i]] = obj[keys[i]];
    }
  }
  return out;
}

export function all(arrays) {
  return arrays[0].filter(item => {
    for(let i = 1, len = arrays.length; i < len; ++i) {
      if(arrays[i].indexOf(item) === -1) {
        return false;
      }
    }
    return true;
  });
}

export function any(arrays) {
  const out = arrays[0];
  for(let i = 1, len = arrays.length; i < len; ++i) {
    const arr = arrays[i];
    for(let j = 0, len = arr.length; j < len; ++j) {
      const item = arr[j];
      if(out.indexOf(item) === -1) {
        out.push(item);
      }
    }
  }
  return out;
}

export function andNot(yes, no) {
  return yes.filter(item => no.indexOf(item) === -1);
}

export function onFunc(alerts) {
  return function() {
    const len = arguments.length - 1, alert = arguments[len];
    if(len !== 0) {
      for(let i = 0; i < len; ++i) {
        alerts[arguments[i]].push(alert);
      }
    } else { // no types passed
      // add this alert to all types
      const types = Object.keys(alerts);
      for(let i = 0, len = types.length; i < len; ++i) {
        alerts[types[i]].push(alert);
      }
    }
  };
}

export function offFunc(alerts) {
  return function() {
    let len = arguments.length - 1;
    if(len === -1) { // no arguments passed
      // remove all alerts from all types
      const types = Object.keys(alerts);
      for(let i = 0, len = types.length; i < len; ++i) {
        alerts[types[i]].length = 0;
      }
    } else {
      let alert = arguments[len], types = arguments;
      if(typeof alert !== 'function') { // no function passed
        // remove all alerts for this type(s)
        alert = undefined;
        ++len;
      } else if(len === 0) { // no alert types passed
        // remove this alert from all types
        types = Object.keys(alerts);
        len = types.length;
      }
      for(let i = 0; i < len; ++i) {
        if(alert) {
          remove(alerts[types[i]], alert);
        } else {
          alerts[types[i]].length = 0;
        }
      }
    }
  };
}
