import * as utils from './utils.js';
import * as has from './has.js';

export function collect(alert, current) {
  const nodes = current !== false ? alert.safeNodes() : [];
  alert.onAdd(node => nodes.push(node));
  alert.onRemove(node => {
    const index = nodes.indexOf(node);
    if(index >= 0) {
      nodes.splice(index, 1);
    }
  });
  return utils.merge(alert, {
    nodes: () => nodes, safeNodes: () => utils.copy(nodes)
  })
}

export function all() {
  const alerts = utils.copy(arguments), len = alerts.length;
  const nodes = has.all(alerts);
  const adders = new Set(), removers = new Set();
  
  const adder = node => {
    const len = alerts.length;
    for(let i = 0; i < len; ++i) {
      if(!alerts[i].has(node)) {
        return;
      }
    }
    nodes.push(node);
    adders.forEach(utils.evaluate1, node);
  };
  const remover = node => {
    const index = nodes.indexOf(node);
    if(index !== -1) {
      nodes.splice(index, 1);
      removers.forEach(utils.evaluate1, node);
    }
  };
  
  for(let i = 0; i < len; ++i) {
    alerts[i].onAdd(adder);
    alerts[i].onRemove(remover);
  }
  
  return {
    has: node => nodes.indexOf(node) !== -1,
    nodes: () => nodes,
    safeNodes: () => utils.copy(nodes),
    onAdd: adder => { adders.add(adder); },
    onRemove: remover => { removers.add(remover); },
    offAdd: adder => adder ? adders.delete(adder) : adders.clear(),
    offRemove: remover => remover ? removers.delete(remover) : removers.clear(),
    off: () => {
      adders.clear(); removers.clear();
    }
  }
}

export function any() {
  const alerts = utils.copy(arguments), len = alerts.length;
  const nodes = has.any(alerts);
  const adders = new Set(), removers = new Set();
  
  const adder = node => {
    if(nodes.indexOf(node) === -1) {
      nodes.push(node);
      adders.forEach(utils.evaluate1, node);
    }
  };
  const remover = node => {
    const len = alerts.length;
    for(let i = 0; i < len; ++i) {
      if(alerts[i].has(node)) {
        return;
      }
    }
    nodes.splice(nodes.indexOf(node), 1);
    removers.forEach(utils.evaluate1, node);
  };
  
  for(let i = 0; i < len; ++i) {
    alerts[i].onAdd(adder);
    alerts[i].onRemove(remover);
  }
  
  return {
    has: node => nodes.indexOf(node) !== -1,
    nodes: () => nodes,
    safeNodes: () => utils.copy(nodes),
    onAdd: adder => { adders.add(adder); },
    onRemove: remover => { removers.add(remover); },
    offAdd: adder => adder ? adders.delete(adder) : adders.clear(),
    offRemove: remover => remover ? removers.delete(remover) : removers.clear(),
    off: () => {
      adders.clear(); removers.clear();
    }
  }
}

export function andNot(yes, no) {
  const nodes = has.andNot(yes, no);
  const adders = new Set(), removers = new Set();
  
  yes.onAdd(node => {
    if(!no.has(node)) {
      nodes.push(node);
      adders.forEach(utils.evaluate1, node);
    }
  });
  const remover = node => {
    const index = nodes.indexOf(node);
    if(index !== -1) {
      nodes.splice(index, 1);
      removers.forEach(utils.evaluate1, node);
    }
  };
  yes.onRemove(remover);
  no.onAdd(remover);
  no.onRemove(node => {
    if(yes.has(node)) {
      nodes.push(node);
      adders.forEach(utils.evaluate1, node);
    }
  });
  
  return {
    has: node => nodes.indexOf(node) !== -1,
    nodes: () => nodes,
    safeNodes: () => utils.copy(nodes),
    onAdd: adder => { adders.add(adder); },
    onRemove: remover => { removers.add(remover); },
    offAdd: adder => adder ? adders.delete(adder) : adders.clear(),
    offRemove: remover => remover ? removers.delete(remover) : removers.clear(),
    off: () => {
      adders.clear(); removers.clear();
    }
  }
}
