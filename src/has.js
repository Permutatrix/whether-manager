import * as utils from './utils.js';

function getNodes(item) {
  return item.nodes();
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

function getNodes2(item, index) {
  return index ? item.nodes() : item.safeNodes();
}
export function any(nodes_) {
  if(Array.isArray(nodes_)) {
    return utils.any(nodes_.map(getNodes2));
  } else {
    const len = arguments.length;
    if(len === 0) {
      return [];
    }
    const nodes = Array(len);
    nodes[0] = nodes_.safeNodes();
    for(let i = 1; i < len; ++i) {
      nodes[i] = arguments[i].nodes();
    }
    return utils.any(nodes);
  }
}

export function andNot(yes, no) {
  return utils.andNot(yes.nodes(), no.nodes());
}
