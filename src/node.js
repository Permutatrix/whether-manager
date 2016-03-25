import * as utils from './utils.js';

export function node() {
  let self;
  const nodeMap = new Map();
  
  const set = (node, value) => {
    if((value === undefined && !nodeMap.has(node)) || nodeMap.get(node) !== value) {
      nodeMap.set(node, value);
      node.set(self, value);
      return true;
    }
    return false;
  };
  const remove = node => {
    if(nodeMap.has(node)) {
      nodeMap.delete(node);
      node.remove(self);
      return true;
    }
    return false;
  };
  const has = node => nodeMap.has(node);
  const get = node => nodeMap.get(node);
  const nodes = () => {
    const keys = [];
    nodeMap.forEach(utils.pushB, keys);
    return keys;
  };
  
  return self = {
    set, remove, has, get, nodes, safeNodes: nodes
  };
}

function alertify(node) {
  const adders = [], updaters = [], removers = [];
  
  const nhas = node.has, nset = node.set, nremove = node.remove, nnodes = node.nodes;
  node.set = (node, value) => {
    const haveIt = nhas(node);
    if(nset(node, value)) {
      const alerts = (haveIt ? updaters : adders);
      for(let i = 0, len = alerts.length; i < len; ++i) {
        alerts[i](node, value);
      }
      return true;
    }
    return false;
  };
  const remove = node.remove = node => {
    if(nremove(node)) {
      utils.executeAll(removers, node);
      return true;
    }
    return false;
  };
  
  const alerts = { 'add': adders, 'update': updaters, 'remove': removers };
  node.on = utils.onFunc(alerts);
  node.off = utils.offFunc(alerts);
  
  return node;
}

export function supernode() {
  return alertify(node());
}
