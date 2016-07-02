import * as utils from './utils.js';
import secret from './secret.js';
import * as has from './has.js';
import * as lazy from './lazy.js';

function construct(nodes, alerts, pimpl) {
  const out = {
    has: node => !utils.excludes(nodes, node),
    nodes: nodes,
    getNodes: copy => copy === undefined || copy ? utils.copy(nodes) : nodes,
    on: utils.onFunc(alerts),
    off: utils.offFunc(alerts)
  };
  secret.set(out, pimpl);
  return Object.freeze(out);
}

export function all(...items) {
  if(Array.isArray(items[0])) {
    items = items[0];
  }
  
  const nodes = has.all(items);
  const adders = [], removers = [];
  const pAdders = [], pRemovers = [];
  const adding = [], removing = [];
  
  const lazyHases = Array(items.length);
  for(let i = 0, len = items.length; i < len; ++i) {
    const item = secret.get(items[i]);
    if(!item) {
      throw Error("Attempted to include a non-family in an all()!");
    }
    lazyHases[i] = item.lazyHas;
  }
  const lazyHas = node => {
    for(let i = 0, len = lazyHases.length; i < len; ++i) {
      if(!lazyHases[i](node)) {
        return false;
      }
    }
    return true;
  };
  
  const pAdder = node => {
    if(lazyHas(node)) {
      nodes.push(node);
      adding.push(node);
      utils.executeAll(pAdders, node);
    }
  };
  const pRemover = node => {
    if(utils.remove(nodes, node) !== -1) {
      removing.push(node);
      utils.executeAll(pRemovers, node);
    }
  };
  const adder = node => {
    if(utils.remove(adding, node) !== -1) {
      utils.executeAll(adders, node);
    }
  };
  const remover = node => {
    if(utils.remove(removing, node) !== -1) {
      utils.executeAll(removers, node);
    }
  };
  
  for(let i = 0, len = items.length; i < len; ++i) {
    const item = secret.get(items[i]);
    item.adders.push(pAdder);
    item.removers.push(pRemover);
    items[i].on('add', adder);
    items[i].on('remove', remover);
  }
  
  return construct(
    nodes,
    { 'add': adders, 'remove': removers },
    { adders: pAdders, removers: pRemovers, lazyHas }
  );
}

export function any(...items) {
  if(Array.isArray(items[0])) {
    items = items[0];
  }
  
  const nodes = has.any(items);
  const adders = [], removers = [];
  const pAdders = [], pRemovers = [];
  const adding = [], removing = [];
  
  const lazyHases = Array(items.length);
  for(let i = 0, len = items.length; i < len; ++i) {
    const item = secret.get(items[i]);
    if(!item) {
      throw Error("Attempted to include a non-family in an any()!");
    }
    lazyHases[i] = item.lazyHas;
  }
  const lazyHas = node => {
    for(let i = 0, len = lazyHases.length; i < len; ++i) {
      if(lazyHases[i](node)) {
        return true;
      }
    }
    return false;
  };
  
  const pAdder = node => {
    if(utils.excludes(nodes, node)) {
      nodes.push(node);
      adding.push(node);
      utils.executeAll(pAdders, node);
    }
  };
  const pRemover = node => {
    if(!lazyHas(node)) {
      utils.remove(nodes, node);
      removing.push(node);
      utils.executeAll(pRemovers, node);
    }
  };
  const adder = node => {
    if(utils.remove(adding, node) !== -1) {
      utils.executeAll(adders, node);
    }
  };
  const remover = node => {
    if(utils.remove(removing, node) !== -1) {
      utils.executeAll(removers, node);
    }
  };
  
  for(let i = 0, len = items.length; i < len; ++i) {
    const item = secret.get(items[i]);
    item.adders.push(pAdder);
    item.removers.push(pRemover);
    items[i].on('add', adder);
    items[i].on('remove', remover);
  }
  
  return construct(
    nodes,
    { 'add': adders, 'remove': removers },
    { adders: pAdders, removers: pRemovers, lazyHas }
  );
}

export function andNot(yes, no) {
  const nodes = has.andNot(yes, no);
  const adders = [], removers = [];
  const pAdders = [], pRemovers = [];
  const adding = [], removing = [];
  
  const yesSecret = secret.get(yes);
  const noSecret = secret.get(no);
  if(!yesSecret || !noSecret) {
    throw Error("Attempted to include a non-family in an andNot()!");
  }
  const lazyHas = node => (yesSecret.lazyHas(node) && !noSecret.lazyHas(node));
  
  const pAdder = node => {
    if(lazyHas(node)) {
      nodes.push(node);
      adding.push(node);
      utils.executeAll(pAdders, node);
    }
  };
  const pRemover = node => {
    if(utils.remove(nodes, node) !== -1) {
      removing.push(node);
      utils.executeAll(pRemovers, node);
    }
  };
  const adder = node => {
    if(utils.remove(adding, node) !== -1) {
      utils.executeAll(adders, node);
    }
  };
  const remover = node => {
    if(utils.remove(removing, node) !== -1) {
      utils.executeAll(removers, node);
    }
  };
  
  yesSecret.adders.push(pAdder);
  yesSecret.removers.push(pRemover);
  yes.on('add', adder);
  yes.on('remove', remover);
  
  noSecret.adders.push(pRemover);
  noSecret.removers.push(pAdder);
  no.on('add', remover);
  no.on('remove', adder);
  
  return construct(
    nodes,
    { 'add': adders, 'remove': removers },
    { adders: pAdders, removers: pRemovers, lazyHas }
  );
}
