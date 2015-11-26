function evaluate1(cb) {
  cb(this);
}
function evaluate2(cb) {
  cb(this[0], this[1]);
}

export function create(emit) {
  let self;
  const nodes = new Map();
  let adders, updaters, removers;
  if(emit) {
    adders = new Set(); updaters = new Set(); removers = new Set();
  }
  
  const set = emit ?
    (node, value) => {
      const haveIt = nodes.has(node);
      if(!haveIt || nodes.get(node) !== value) {
        nodes.set(node, value);
        node.set(self, value);
        (haveIt ? updaters : adders).forEach(evaluate2, [node, value]);
        return true;
      }
      return false;
    } :
    (node, value) => {
      if((value === undefined && !nodes.has(node)) || nodes.get(node) !== value) {
        nodes.set(node, value);
        node.set(self, value);
        return true;
      }
      return false;
    };
  const remove = emit ?
    node => {
      if(nodes.has(node)) {
        nodes.delete(node);
        node.remove(self);
        removers.forEach(evaluate1, node);
        return true;
      }
      return false;
    } :
    node => {
      if(nodes.has(node)) {
        nodes.delete(node);
        node.remove(self);
        return true;
      }
      return false;
    };
  const clear = emit ?
    () => {
      nodes.forEach(remove);
      adders.clear(); updaters.clear(); removers.clear();
    } :
    () => {
      nodes.forEach(remove);
    };
  const has = node => nodes.has(node);
  const get = node => nodes.get(node);
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
    const offAdd = adder => adders.delete(adder);
    const offUpdate = updater => updaters.delete(updater);
    const offSet = setter => {
      const adder = adders.delete(setter);
      return updaters.delete(setter) || adder;
    };
    const offRemove = remover => removers.delete(remover);
    return self = {
      set, remove, clear, has, get,
      onAdd, onUpdate, onSet, onRemove,
      offAdd, offUpdate, offSet, offRemove
    };
  }
  return self = {
    set, remove, clear, has, get
  };
}
