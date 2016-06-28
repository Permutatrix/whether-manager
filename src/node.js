import * as utils from './utils.js';
import secret from './secret.js';

const lock = {};

function basicNode(name) {
  let self;
  // this is faster than a Map as long as you keep your link count down.
  // it's also absolutely appalling... but let's not worry about that.
  const nodes = [], values = [];
  
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
      utils.removeIndex(values, index);
      node.remove(self);
      return true;
    }
    return false;
  };
  const has = node => {
    return node.nodes.length < nodes.length ?
             !utils.excludes(node.nodes, self) :
             !utils.excludes(nodes, node);
  };
  const get = (node, unvalue) => {
    if(node.nodes.length < nodes.length) {
      const index = utils.indexOf(node.nodes, self);
      if(index !== -1) {
        return node.values[index];
      }
    } else {
      const index = utils.indexOf(nodes, node);
      if(index !== -1) {
        return values[index];
      }
    }
    return unvalue;
  };
  const getNodes = copy => copy === undefined || copy ? utils.copy(nodes) : nodes;
  
  self = {
    name, set, remove, has, get, getNodes, nodes, values
  };
  return self;
}

export function node(name) {
  return Object.freeze(basicNode(name));
}

export function supernode(name) {
  const self = basicNode(name);
  const adders = [], updaters = [], removers = [];
  const pAdders = [], pRemovers = [];
  
  const nhas = self.has, nset = self.set, nremove = self.remove, nnodes = self.nodes, nvalues = self.values;
  
  secret.set(self, { adders: pAdders, removers: pRemovers, lazyHas: nhas });
  
  self.set = (node, value) => {
    const length = nnodes.length;
    if(nset(node, value)) {
      let alerts = updaters;
      if(nnodes.length > length) {
        alerts = adders;
        utils.executeAll(pAdders, node);
      }
      for(let i = 0, len = alerts.length; i < len; ++i) {
        alerts[i](node, value);
      }
      return true;
    }
    return false;
  };
  self.remove = node => {
    const index = utils.remove(nnodes, node);
    if(index !== -1) {
      const value = nvalues[index];
      utils.removeIndex(nvalues, index);
      utils.executeAll(pRemovers, node);
      node.remove(self);
      for(let i = 0, len = removers.length; i < len; ++i) {
        removers[i](node, value);
      }
      return true;
    }
    return false;
  };
  
  const alerts = { 'add': adders, 'update': updaters, 'remove': removers };
  self.on = utils.onFunc(alerts);
  self.off = utils.offFunc(alerts);
  
  return Object.freeze(self);
}
