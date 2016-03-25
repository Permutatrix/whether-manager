import * as utils from './utils.js';

function getNodes(item) {
  return item.safeNodes();
}
export function all(nodes_) {
  if(Array.isArray(nodes_)) {
    return utils.all(nodes_.map(getNodes));
  } else {
    const len = arguments.length, nodes = Array(len);
    for(let i = 0; i < len; ++i) {
      nodes[i] = arguments[i].nodes();
    }
    return utils.all(nodes);
  }
}

export function any(nodes_) {
  if(Array.isArray(nodes_)) {
    return utils.any(nodes_.map(getNodes));
  } else {
    const len = arguments.length, nodes = Array(len);
    for(let i = 0; i < len; ++i) {
      nodes[i] = arguments[i].safeNodes();
    }
    return utils.any(nodes);
  }
}

export function andNot(yes, no) {
  return utils.andNot(yes.nodes(), no.nodes());
}
