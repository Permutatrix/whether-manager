import * as utils from './utils.js';
import * as has from './has.js';

export function collect(alert, current) {
  const nodes = current !== false ? alert.safeNodes() : [];
  alert.onAdd(node => nodes.push(node));
  alert.onRemove(node => {
    const index = nodes.indexOf(node);
    if(index >= 0) {
      nodes.splice(index, 1);
    }
  });
  return utils.merge(alert, {
    nodes: () => nodes, safeNodes: () => utils.clone(nodes)
  })
}
