import * as utils from './utils.js';

function getNodes(item, index) {
  return index ? item.nodes() : item.safeNodes();
}
export function all() {
  let nodes = arguments[0];
  if(!Array.isArray(nodes)) {
    nodes = utils.copy(arguments);
  }
  return utils.all(nodes.map(getNodes));
}

export function any() {
  let nodes = arguments[0];
  if(!Array.isArray(nodes)) {
    nodes = utils.copy(arguments);
  }
  return utils.any(nodes.map(getNodes));
}

export function andNot(yes, no) {
  return utils.andNot(yes.safeNodes(), no.nodes());
}
