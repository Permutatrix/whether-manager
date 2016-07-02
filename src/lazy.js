// Hey. I could fetch these nodes in ten microseconds flat!

import * as has from './has.js';

export function all(...groups) {
  if(Array.isArray(groups[0])) {
    groups = groups[0];
  }
  return Object.freeze({
    has: node => {
      for(let i = 0, len = groups.length; i < len; ++i) {
        if(!groups[i].has(node)) {
          return false;
        }
      }
      return true;
    },
    getNodes: () => has.all(groups)
  });
}

export function any(...groups) {
  if(Array.isArray(groups[0])) {
    groups = groups[0];
  }
  return Object.freeze({
    has: node => {
      for(let i = 0, len = groups.length; i < len; ++i) {
        if(groups[i].has(node)) {
          return true;
        }
      }
      return false;
    },
    getNodes: () => has.any(groups)
  });
}

export function andNot(yes, no) {
  return Object.freeze({
    has: node => (yes.has(node) && !no.has(node)),
    getNodes: () => has.andNot(yes, no)
  });
}
