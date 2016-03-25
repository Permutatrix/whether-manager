import * as utils from './utils.js';

const allNodes = new WeakSet();

function basicNode(name) {
  let self;
  const nodeMap = new Map();
  
  const set = (node, value) => {
    if(!allNodes.has(node)) {
      throw Error("Attempted to link a node to a non-node!");
    }
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
  
  self = {
    name, set, remove, has, get, nodes, safeNodes: nodes
  };
  allNodes.add(self);
  return self;
}

export function node(name) {
  return Object.freeze(basicNode(name));
}

export function supernode(name) {
  const node = basicNode(name);
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
  
  return Object.freeze(node);
}
