import * as has from './has.js';

export function all() {
  const items = utils.copy(arguments);
  const nodes = () => has.all(items);
  
  return {
    has: node => {
      const len = items.length;
      for(let i = 0; i < len; ++i) {
        if(!items[i].has(node)) {
          return false;
        }
      }
      return true;
    },
    nodes, safeNodes: nodes
  };
}
