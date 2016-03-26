// Hey. I could fetch these nodes in ten microseconds flat!

import * as has from './has.js';

export function all(...items) {
  return {
    has: node => {
      for(let i = 0, len = items.length; i < len; ++i) {
        if(!items[i].has(node)) {
          return false;
        }
      }
      return true;
    },
    getNodes: () => has.all(items)
  };
}

export function any(...items) {
  return {
    has: node => {
      for(let i = 0, len = items.length; i < len; ++i) {
        if(items[i].has(node)) {
          return true;
        }
      }
      return false;
    },
    getNodes: () => has.any(items)
  };
}

export function andNot(yes, no) {
  
  return {
    has: node => (yes.has(node) && !no.has(node)),
    getNodes: () => has.andNot(yes, no)
  };
}
