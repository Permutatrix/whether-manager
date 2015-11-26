function evaluate1(cb) {
  cb(this);
}
function evaluate2(cb) {
  cb(this[0], this[1]);
}
function pushB(a, b) {
  this.push(b);
}

export function create(emit) {
  let self;
  const nodeMap = new Map();
  let adders, updaters, removers;
  if(emit) {
    adders = new Set(); updaters = new Set(); removers = new Set();
  }
  
  const set = emit ?
    (node, value) => {
      const haveIt = nodeMap.has(node);
      if(!haveIt || nodeMap.get(node) !== value) {
        nodeMap.set(node, value);
        node.set(self, value);
        (haveIt ? updaters : adders).forEach(evaluate2, [node, value]);
        return true;
      }
      return false;
    } :
    (node, value) => {
      if((value === undefined && !nodeMap.has(node)) || nodeMap.get(node) !== value) {
        nodeMap.set(node, value);
        node.set(self, value);
        return true;
      }
      return false;
    };
  const remove = emit ?
    node => {
      if(nodeMap.has(node)) {
        nodeMap.delete(node);
        node.remove(self);
        removers.forEach(evaluate1, node);
        return true;
      }
      return false;
    } :
    node => {
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
  if(emit) {
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
    return self = {
      set, remove, clear, has, get, nodes,
      onAdd, onUpdate, onSet, onRemove,
      offAdd, offUpdate, offSet, offRemove, off
    };
  }
  return self = {
    set, remove, clear, has, get, nodes
  };
}
