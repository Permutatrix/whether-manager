function evaluate1(cb) {
  cb(this);
}
function evaluate2(cb) {
  cb(this[0], this[1]);
}
function pushB(a, b) {
  this.push(b);
}

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
    nodeMap.forEach(pushB, keys);
    return keys;
  };
  return self = {
    set, remove, clear, has, get, nodes
  };
}

export function alert(node) {
  const adders = new Set(), updaters = new Set(), removers = new Set();
  
  const has = node.has;
  const set = node.set;
  node.set = (node, value) => {
    const haveIt = has(node);
    if(set(node, value)) {
      (haveIt ? updaters : adders).forEach(evaluate2, [node, value]);
      return true;
    }
    return false;
  };
  const remove = node.remove;
  node.remove = node => {
    if(remove(node)) {
      removers.forEach(evaluate1, node);
      return true;
    }
    return false;
  };
  
  node.onAdd = adder => {
    adders.add(adder);
  };
  node.onUpdate = updater => {
    updaters.add(updater);
  };
  node.onSet = setter => {
    adders.add(setter);
    updaters.add(setter);
  };
  node.onRemove = remover => {
    removers.add(remover);
  };
  node.offAdd = adder => adder ? adders.delete(adder) : adders.clear();
  node.offUpdate = updater => updater ? updaters.delete(updater) : updaters.clear();
  node.offSet = setter => {
    if(setter) {
      const adder = adders.delete(setter);
      return updaters.delete(setter) || adder;
    }
    adders.clear(); updaters.clear();
  };
  node.offRemove = remover => remover ? removers.delete(remover) : removers.clear();
  node.off = () => {
    adders.clear(); updaters.clear(); removers.clear();
  }
  return node;
}

export function alertNode() {
  return alert(node());
}
