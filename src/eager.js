import * as utils from './utils.js';
import secret from './secret.js';
import * as has from './has.js';
import * as lazy from './lazy.js';

function construct(type, nodes, alerts, pimpl) {
  const out = {
    has: node => !utils.excludes(nodes, node),
    getNodes: () => utils.copy(nodes),
    getCount: () => nodes.length,
    some: cb => {
      const startingRemovals = pimpl.removals;
      for(let i = 0; i < nodes.length; ++i) {
        if(cb(nodes[i])) {
          return true;
        }
        if(pimpl.removals !== startingRemovals) {
          throw Error(`${pimpl.removals - startingRemovals} nodes removed ` +
                      `from ${type}() during some() traversal!`);
        }
      }
      return false;
    },
    on: utils.onFunc(alerts),
    off: utils.offFunc(alerts)
  };
  secret.set(out, pimpl);
  return Object.freeze(out);
}

export function all(...families) {
  if(Array.isArray(families[0])) {
    families = families[0];
  }
  
  const nodes = has.all(families);
  const adders = [], removers = [];
  const pAdders = [], pRemovers = [];
  const adding = [], removing = [];
  
  const lazyHases = Array(families.length); // initialize later
  const lazyHas = node => {
    for(let i = 0, len = lazyHases.length; i < len; ++i) {
      if(!lazyHases[i](node)) {
        return false;
      }
    }
    return true;
  };
  
  const pimpl = { adders: pAdders, removers: pRemovers, lazyHas, removals: 0 };
  
  const pAdder = node => {
    if(lazyHas(node)) {
      nodes.push(node);
      adding.push(node);
      utils.executeAll(pAdders, node);
    }
  };
  const pRemover = node => {
    if(utils.remove(nodes, node) !== -1) {
      ++pimpl.removals;
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
  
  for(let i = 0, len = families.length; i < len; ++i) {
    const item = secret.get(families[i]);
    if(!item) {
      throw Error("Attempted to include a non-family in an all()!");
    }
    lazyHases[i] = item.lazyHas;
    item.adders.push(pAdder);
    item.removers.push(pRemover);
    families[i].on('add', adder);
    families[i].on('remove', remover);
  }
  
  return construct(
    "all",
    nodes,
    { 'add': adders, 'remove': removers },
    pimpl
  );
}

export function any(...families) {
  if(Array.isArray(families[0])) {
    families = families[0];
  }
  
  const nodes = has.any(families);
  const adders = [], removers = [];
  const pAdders = [], pRemovers = [];
  const adding = [], removing = [];
  
  const lazyHases = Array(families.length); // initialize later
  const lazyHas = node => {
    for(let i = 0, len = lazyHases.length; i < len; ++i) {
      if(lazyHases[i](node)) {
        return true;
      }
    }
    return false;
  };
  
  const pimpl = { adders: pAdders, removers: pRemovers, lazyHas, removals: 0 };
  
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
      ++pimpl.removals;
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
  
  for(let i = 0, len = families.length; i < len; ++i) {
    const item = secret.get(families[i]);
    if(!item) {
      throw Error("Attempted to include a non-family in an any()!");
    }
    lazyHases[i] = item.lazyHas;
    item.adders.push(pAdder);
    item.removers.push(pRemover);
    families[i].on('add', adder);
    families[i].on('remove', remover);
  }
  
  return construct(
    "any",
    nodes,
    { 'add': adders, 'remove': removers },
    pimpl
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
  const pimpl = { adders: pAdders, removers: pRemovers, lazyHas, removals: 0 };
  
  const pAdder = node => {
    if(lazyHas(node)) {
      nodes.push(node);
      adding.push(node);
      utils.executeAll(pAdders, node);
    }
  };
  const pRemover = node => {
    if(utils.remove(nodes, node) !== -1) {
      ++pimpl.removals;
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
    "andNot",
    nodes,
    { 'add': adders, 'remove': removers },
    pimpl
  );
}
