// This is the most horrifying code I've written in a while.

var tests = {};

function describe(desc, func) {
  var parent = tests;
  tests = tests[desc] = {};
  func();
  tests = parent;
}
function it(desc, func) {
  tests[desc] = func;
}

function noopChain() {
  var out = function() { return out; },
      props = ['be', 'not', 'true', 'false', 'undefined', 'equal', 'eql', 'truthy', 'empty', 'have', 'length', 'include'];
  for(var i = 0, len = props.length; i < len; ++i) {
    Object.defineProperty(out, props[i], {
      get: function() {
        return out;
      }
    });
  }
  return out;
}

if(typeof require === 'function') {
  global.describe = describe;
  global.it = it;
  require('../test/test.js');
} else {
  var require = function require(path) {
    var module = {};
    var exports = module.exports = {};
    if(path === 'must') {
      return noopChain();
    } else if(path === '..') {
      (new Function('module', 'exports', 'require', read('../whether-manager.js')))(module, exports, require);
    } else {
      (new Function('module', 'exports', 'require', read(path)))(module, exports, require);
    }
    return module.exports;
  }
  require('../test/test.js');
}

if(typeof dateNow !== 'function') {
  dateNow = function() {
    return Date.now();
  };
}

function call(name, iterations, object, timer, indent) {
  indent = indent || "";
  var t = timer && timer(indent, name);
  t && t.announce && t.announce();
  for(var key in object) {
    var v = object[key];
    if(typeof v === 'function') {
      var t2 = timer && timer(indent + "  ", key);
      for(var i = 0; i < iterations; ++i) {
        v();
      }
      t2 && t2();
    } else {
      call(key, iterations, v, timer, indent + "  ");
    }
  }
  t && t();
}

var output = {};

var s = dateNow();
for(var i = 0; i < 5000; ++i) {
  call("Warmup", 1, tests);
}
output["Warmup"] = dateNow() - s;

call("Total", 50000, tests, function(indent, name) {
  var parent = output;
  var child = output = parent[name] = 0;
  var s;
  var out = function() {
    var time = dateNow() - s;
    if(child) {
      child["Total"] = time;
    } else {
      parent[name] = time;
    }
    output = parent;
  };
  out.announce = function() {
    child = output = parent[name] = {};
  }
  s = dateNow();
  return out;
});

console.log(JSON.stringify(output, null, 2));
