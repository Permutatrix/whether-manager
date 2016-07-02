import * as utils from './utils.js';

export function all(groups) {
  if(!Array.isArray(groups)) {
    const len = arguments.length;
    groups = Array(len);
    for(let i = 0; i < len; ++i) {
      groups[i] = arguments[i];
    }
  }
  return groups[0].getNodes(false).filter(item => {
    for(let i = 1, len = groups.length; i < len; ++i) {
      if(!groups[i].has(item)) {
        return false;
      }
    }
    return true;
  });
}

function getNodes(item, index) {
  return item.getNodes(index === 0);
}
export function any(groups) {
  if(Array.isArray(groups)) {
    return utils.any(groups.map(getNodes));
  } else {
    const len = arguments.length, groups_ = Array(len);
    for(let i = 0; i < len; ++i) {
      groups_[i] = arguments[i].getNodes(i === 0);
    }
    return utils.any(groups_);
  }
}

export function andNot(yes, no) {
  return yes.getNodes(false).filter(item => !no.has(item));
}
