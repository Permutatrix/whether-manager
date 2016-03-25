import * as utils from './utils.js';
import * as has from './has.js';
import * as lazy from './lazy.js';

export function collect(alert) {
  const nodes = alert.safeNodes();
  alert.on('add', node => nodes.push(node));
  alert.on('remove', node => utils.remove(nodes, node));
  return utils.merge(alert, {
    nodes: () => nodes
  });
}

function construct(minion, nodes, alerts) {
  minion.nodes = () => nodes;
  minion.on = utils.onFunc(alerts);
  minion.off = utils.offFunc(alerts);
  return minion;
}

export function all(...items) {
  const nodes = has.all(items);
  const adders = [], removers = [];
  
  const adder = node => {
    for(let i = 0, len = items.length; i < len; ++i) {
      if(!items[i].has(node)) {
        return;
      }
    }
    nodes.push(node);
    utils.executeAll(adders, node);
  };
  const remover = node => {
    if(utils.remove(nodes, node)) {
      utils.executeAll(removers, node);
    }
  };
  
  for(let i = 0, len = items.length; i < len; ++i) {
    items[i].on('add', adder);
    items[i].on('remove', remover);
  }
  
  return construct(lazy.all(...items), nodes, { 'add': adders, 'remove': removers });
}

export function any(...items) {
  const nodes = has.any(items);
  const adders = [], removers = [];
  
  const adder = node => {
    if(nodes.indexOf(node) === -1) {
      nodes.push(node);
      utils.executeAll(adders, node);
    }
  };
  const remover = node => {
    for(let i = 0, len = items.length; i < len; ++i) {
      if(items[i].has(node)) {
        return;
      }
    }
    nodes.splice(nodes.indexOf(node), 1);
    utils.executeAll(removers, node);
  };
  
  for(let i = 0, len = items.length; i < len; ++i) {
    items[i].on('add', adder);
    items[i].on('remove', remover);
  }
  
  return construct(lazy.any(...items), nodes, { 'add': adders, 'remove': removers });
}

export function andNot(yes, no) {
  const nodes = has.andNot(yes, no);
  const adders = [], removers = [];
  
  yes.on('add', node => {
    if(!no.has(node)) {
      nodes.push(node);
      utils.executeAll(adders, node);
    }
  });
  const remover = node => {
    if(utils.remove(nodes, node)) {
      utils.executeAll(removers, node);
    }
  };
  yes.on('remove', remover);
  no.on('add', remover);
  no.on('remove', node => {
    if(yes.has(node)) {
      nodes.push(node);
      utils.executeAll(adders, node);
    }
  });
  
  return construct(lazy.andNot(yes, no), nodes, { 'add': adders, 'remove': removers });
}
