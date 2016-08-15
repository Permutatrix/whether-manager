import * as utils from './utils.js';
import secret from './secret.js';

export function node(name) {
  let self;
  // this is faster than a Map as long as you keep your link count down.
  // it's also absolutely appalling... but let's not worry about that.
  const nodes = [], values = [];
  let removals = 0;
  
  const set = (node, value) => {
    const index = utils.indexOf(nodes, node);
    if(index === -1 || values[index] !== value) {
      if(index === -1) {
        nodes.push(node);
        values.push(value);
      } else {
        values[index] = value;
      }
      node.set(self, value);
      return true;
    }
    return false;
  };
  const remove = node => {
    const index = utils.remove(nodes, node);
    if(index !== -1) {
      ++removals;
      utils.removeIndex(values, index);
      node.remove(self);
      return true;
    }
    return false;
  };
  const has = node => {
    return !utils.excludes(nodes, node);
  };
  const get = (node, unvalue) => {
    const index = utils.indexOf(nodes, node);
    return index === -1 ? unvalue : values[index];
  };
  const getNodes = () => utils.copy(nodes);
  const getCount = () => nodes.length;
  const some = cb => {
    const startingRemovals = removals;
    for(let i = 0; i < nodes.length; ++i) {
      if(cb(nodes[i], values[i])) {
        return true;
      }
      if(removals !== startingRemovals) {
        throw Error(`${removals - startingRemovals} nodes removed ` +
                    `from node "${name}" during some() traversal!`);
      }
    }
    return false;
  };
  
  self = {
    name, set, remove, has, get, getNodes, getCount, some
  };
  return Object.freeze(self);
}

// Why be DRY when you can be... not DRY?
export function supernode(name) {
  let self;
  const nodes = [], values = [];
  const adders = [], updaters = [], removers = [];
  const pAdders = [], pRemovers = [];
  let removals = 0;
  
  const set = (node, value) => {
    const index = utils.indexOf(nodes, node);
    if(index === -1 || values[index] !== value) {
      let alerts = updaters;
      if(index === -1) {
        nodes.push(node);
        values.push(value);
        alerts = adders;
        utils.executeAll(pAdders, node);
      } else {
        values[index] = value;
      }
      node.set(self, value);
      for(let i = 0, len = alerts.length; i < len; ++i) {
        alerts[i](node, value);
      }
      return true;
    }
    return false;
  };
  const remove = node => {
    const index = utils.remove(nodes, node);
    if(index !== -1) {
      ++removals;
      const value = values[index];
      utils.removeIndex(values, index);
      utils.executeAll(pRemovers, node);
      node.remove(self);
      for(let i = 0, len = removers.length; i < len; ++i) {
        removers[i](node, value);
      }
      return true;
    }
    return false;
  };
  const has = node => {
    return !utils.excludes(nodes, node);
  };
  const get = (node, unvalue) => {
    const index = utils.indexOf(nodes, node);
    return index === -1 ? unvalue : values[index];
  };
  const getNodes = () => utils.copy(nodes);
  const getCount = () => nodes.length;
  const some = cb => {
    const startingRemovals = removals;
    for(let i = 0; i < nodes.length; ++i) {
      if(cb(nodes[i], values[i])) {
        return true;
      }
      if(removals !== startingRemovals) {
        throw Error(`${removals - startingRemovals} nodes removed from `+
                    `node "${name}" during some() traversal!`);
      }
    }
    return false;
  };
  
  const alerts = { 'add': adders, 'update': updaters, 'remove': removers };
  const on = utils.onFunc(alerts);
  const off = utils.offFunc(alerts);
  
  self = {
    name, set, remove, has, get, getNodes, getCount, some, on, off
  };
  
  secret.set(self, { adders: pAdders, removers: pRemovers, lazyHas: has });
  
  return Object.freeze(self);
}
