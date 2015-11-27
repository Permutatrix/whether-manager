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
  const removeB = (a, b) => remove(b);
  const clear = () => {
    nodeMap.forEach(removeB);
  };
  const has = node => nodeMap.has(node);
  const get = node => nodeMap.get(node);
  const nodes = () => {
    let keys = [];
    nodeMap.forEach(utils.pushB, keys);
    return keys;
  };
  return self = {
    set, remove, clear, has, get, nodes, safeNodes: nodes
  };
}

export function alertify(node) {
  const adders = new Set(), updaters = new Set(), removers = new Set();
  
  const nhas = node.has, nset = node.set, nremove = node.remove, nnodes = node.nodes;
  const set = node.set = (node, value) => {
    const haveIt = nhas(node);
    if(nset(node, value)) {
      (haveIt ? updaters : adders).forEach(utils.evaluate2, [node, value]);
      return true;
    }
    return false;
  };
  const remove = node.remove = node => {
    if(nremove(node)) {
      removers.forEach(utils.evaluate1, node);
      return true;
    }
    return false;
  };
  const clear = node.clear = () => {
    const nodes = nnodes(), len = nodes.length;
    for(let i = 0; i < len; ++i) {
      remove(nodes[i]);
    }
  };
  
  const onAdd = adder => {
    adders.add(adder);
  };
  const onUpdate = updater => {
    updaters.add(updater);
  };
  const onSet = setter => {
    adders.add(setter);
    updaters.add(setter);
  };
  const onRemove = remover => {
    removers.add(remover);
  };
  const offAdd = adder => adder ? adders.delete(adder) : adders.clear();
  const offUpdate = updater => updater ? updaters.delete(updater) : updaters.clear();
  const offSet = setter => {
    if(setter) {
      const adder = adders.delete(setter);
      return updaters.delete(setter) || adder;
    }
    adders.clear(); updaters.clear();
  };
  const offRemove = remover => remover ? removers.delete(remover) : removers.clear();
  const off = () => {
    adders.clear(); updaters.clear(); removers.clear();
  }
  return utils.merge(node, {
    set, remove, clear,
    onAdd, onUpdate, onSet, onRemove,
    offAdd, offUpdate, offSet, offRemove, off
  });
}

export function alertNode() {
  return alertify(node());
}
