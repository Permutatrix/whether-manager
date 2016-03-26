import * as utils from './utils.js';

export function all(nodes) {
  if(Array.isArray(nodes)) {
    return nodes[0].getNodes(false).filter(item => {
      for(let i = 1, len = nodes.length; i < len; ++i) {
        if(!nodes[i].has(item)) {
          return false;
        }
      }
      return true;
    });
  } else {
    const len = arguments.length, nodes_ = Array(len);
    for(let i = 0; i < len; ++i) {
      nodes_[i] = arguments[i];
    }
    return all(nodes_);
  }
}

function getNodes(item, index) {
  return item.getNodes(index === 0);
}
export function any(nodes) {
  if(Array.isArray(nodes)) {
    return utils.any(nodes.map(getNodes));
  } else {
    const len = arguments.length, nodes_ = Array(len);
    for(let i = 0; i < len; ++i) {
      nodes_[i] = arguments[i].getNodes(i === 0);
    }
    return utils.any(nodes_);
  }
}

export function andNot(yes, no) {
  return yes.getNodes(false).filter(item => !no.has(item));
}
