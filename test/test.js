var demand = require('must');
var wm = require('..');

function describeNode(node) {
  
  it("should be frozen", function() {
    var a = node();
    demand(Object.isFrozen(a)).be.truthy();
  });
  
  it("should be linked symmetrically", function() {
    var a = node(), b = node();
    a.set(b, 'x');
    demand(a.has(b)).be.true();
    demand(b.has(a)).be.true();
    demand(a.get(b)).equal('x');
    demand(b.get(a)).equal('x');
  });
  
  it("should be unlinked symmetrically", function() {
    var a = node(), b = node();
    a.set(b, 'x');
    b.remove(a);
    demand(a.has(b)).be.false();
    demand(b.has(a)).be.false();
  });
  
  it("should be allowed to link to itself", function() {
    var a = node();
    demand(a.set(a)).be.true();
    demand(a.has(a)).be.true();
    demand(a.set(a, 'x')).be.true();
    demand(a.get(a)).equal('x');
    demand(a.remove(a)).be.true();
    demand(a.has(a)).be.false();
  });
  
  describe(".name", function() {
    
    it("should be equal to the passed-in name", function() {
      var a = node('a'), b = node('b');
      demand(a.name).equal('a');
      demand(b.name).equal('b');
    });
    
    it("should be undefined if no name is given", function() {
      var a = node();
      demand(a.name).be.undefined();
    });
    
  });
  
  describe(".set()", function() {
    
    it("should return true if there's a change", function() {
      var a = node(), b = node();
      demand(a.set(b)).be.true();
      demand(a.set(b, 'x')).be.true();
      demand(a.set(b)).be.true();
    });
    
    it("should return false otherwise", function() {
      var a = node(), b = node();
      a.set(b);
      demand(a.set(b)).be.false();
      a.set(b, 'x');
      demand(a.set(b, 'x')).be.false();
    });
    
  });
  
  describe(".remove()", function() {
    
    it("should return true if there's a change", function() {
      var a = node(), b = node();
      a.set(b);
      demand(a.remove(b)).be.true();
      a.set(b, 'x');
      demand(a.remove(b)).be.true();
    });
    
    it("should return false otherwise", function() {
      var a = node(), b = node();
      demand(a.remove(b)).be.false();
      a.set(b, 'x');
      a.remove(b);
      demand(a.remove(b)).be.false();
    });
    
  });
  
  describe(".has()", function() {
    
    it("should return true if the nodes are linked", function() {
      var a = node(), b = node();
      a.set(b);
      demand(a.has(b)).be.true();
    });
    
    it("should return false otherwise", function() {
      var a = node(), b = node();
      demand(a.has(b)).be.false();
      a.set(b);
      a.remove(b);
      demand(a.has(b)).be.false();
    });
    
    it("should work when the callee has more nodes than the argument", function() {
      var a = node(), b = node();
      a.set(a);
      demand(a.has(b)).be.false();
      a.set(b);
      demand(a.has(b)).be.true();
      a.remove(b);
      demand(a.has(b)).be.false();
    });
    
  });
  
  describe(".get()", function() {
    
    it("should return the nodes' link value", function() {
      var a = node(), b = node();
      a.set(b, 'x');
      demand(a.get(b)).equal('x');
    });
    
    it("should return the second argument if the nodes aren't linked", function() {
      var a = node(), b = node();
      var o = {};
      demand(a.get(b, o)).equal(o);
      a.set(b, 'x');
      a.remove(b);
      demand(a.get(b, b)).equal(b);
    });
    
    it("should return undefined if the nodes' link value is undefined", function() {
      var a = node(), b = node();
      a.set(b);
      demand(a.get(b, 'x')).be.undefined();
    });
    
    it("should use undefined as the default if no second argument is passed", function() {
      var a = node(), b = node();
      demand(a.get(b)).be.undefined();
    });
    
    it("should work when the callee has more nodes than the argument", function() {
      var a = node(), b = node();
      a.set(a);
      a.set(b, 'x');
      demand(a.get(b)).equal('x');
      a.set(b, 'y');
      demand(a.get(b)).equal('y');
      a.remove(b);
      demand(a.get(b, b)).equal(b);
    });
    
  });
  
  describe(".getNodes()", function() {
    
    it("should return an array of linked nodes", function() {
      var a = node(), b = node(), c = node();
      demand(a.getNodes()).be.empty();
      a.set(b);
      demand(a.getNodes()).be.a.permutationOf([b]);
      a.set(c);
      demand(a.getNodes()).be.a.permutationOf([b, c]);
      a.remove(b);
      demand(a.getNodes()).be.a.permutationOf([c]);
      a.remove(c);
      demand(a.getNodes()).be.empty();
    });
    
    it("should return a new array on each invocation", function() {
      var a = node(), b = node();
      demand(a.getNodes()).not.equal(a.getNodes());
      a.set(b);
      demand(a.getNodes()).not.equal(a.getNodes());
    });
    
  });
  
  describe(".getCount()", function() {
    
    it("should return the number of linked nodes", function() {
      var a = node(), b = node(), c = node();
      demand(a.getCount()).equal(0);
      a.set(b);
      demand(a.getCount()).equal(1);
      a.set(c);
      demand(a.getCount()).equal(2);
      a.remove(b);
      demand(a.getCount()).equal(1);
      a.set(a);
      demand(a.getCount()).equal(2);
      a.remove(c);
      a.remove(a);
      demand(a.getCount()).equal(0);
    });
    
  });
  
  describe(".some()", function() {
    
    function collect(cb) {
      const out = [];
      cb(function(x) { out.push(x); });
      return out;
    }
    
    it("should iterate over every linked node", function() {
      var a = node(), b = node(), c = node();
      a.set(b);
      demand(collect(a.some)).be.a.permutationOf([b]);
      a.set(c);
      demand(collect(a.some)).be.a.permutationOf([b, c]);
      a.remove(b);
      demand(collect(a.some)).be.a.permutationOf([c]);
      a.set(a);
      demand(collect(a.some)).be.a.permutationOf([c, a]);
    });
    
    it("should pass in link values as the second argument", function() {
      var a = node(), b = node();
      a.set(b, 'b');
      a.some(function(node, value) {
        demand(value).equal('b');
      });
    });
    
    it("should handle a node with no links", function() {
      var a = node();
      a.some(function() {
        throw Error("The callback was called!");
      });
    });
    
    it("should stop iteration and return true when a truthy value is returned", function() {
      var a = node(), b = node();
      a.set(a);
      a.set(b);
      var first = true;
      demand(a.some(function() {
        if(first) {
          first = false;
          return true;
        } else {
          throw Error("The callback was called a second time!");
        }
      })).be.true();
      demand(a.some(function() {
        if(!first) {
          first = true;
          return 1;
        } else {
          throw Error("The callback was called a second time!");
        }
      })).be.true();
    });
    
    it("should continue to the end and return false otherwise", function() {
      var a = node(), b = node();
      a.set(a);
      a.set(b);
      var calls = 0;
      demand(a.some(function() {
        ++calls;
        return false;
      })).be.false();
      demand(calls).equal(2);
      demand(a.some(function() {
        ++calls;
      })).be.false();
      demand(calls).equal(4);
    });
    
    it("should include nodes added during iteration", function() {
      var a = node(), b = node();
      a.set(a);
      var calledWithB = false;
      a.some(function(node, value) {
        if(node === b) {
          demand(value).equal('b');
          calledWithB = true;
        } else {
          a.set(b, 'b');
        }
      });
      demand(calledWithB).be.true();
    });
    
    it("should throw if nodes are removed during iteration", function() {
      var a = node(), b = node();
      a.set(a);
      a.set(b);
      demand(function() {
        a.some(function() {
          a.remove(b);
        });
      }).throw(/nodes removed from node/);
    });
    
    it("should throw if the only node is removed during iteration", function() {
      var a = node(), b = node();
      a.set(b);
      demand(function() {
        a.some(function() {
          a.remove(b);
        });
      }).throw(/nodes removed from node/);
    });
    
  });
  
}

describe("Node", function() {
  
  describeNode(wm.node);
  
});

describe("Supernode", function() {
  
  describeNode(wm.supernode);
  
  describe(".on()", function() {
    
    it("should allow listening for 'add'", function() {
      var x = wm.supernode(), calls = 0;
      x.on('add', function() {
        ++calls;
      });
      x.set(x);
      demand(calls).equal(1);
    });
    
    it("should allow listening for 'update'", function() {
      var x = wm.supernode(), calls = 0;
      x.on('update', function() {
        ++calls;
      });
      x.set(x);
      x.set(x, 'x');
      demand(calls).equal(1);
    });
    
    it("should allow listening for 'remove'", function() {
      var x = wm.supernode(), calls = 0;
      x.on('remove', function() {
        ++calls;
      });
      x.set(x);
      x.remove(x);
      demand(calls).equal(1);
    });
    
    it("should not notify 'update' when a node is first linked", function() {
      var x = wm.supernode(), calls = 0;
      x.on('update', function() {
        ++calls;
      });
      x.set(x, 'x');
      demand(calls).equal(0);
    });
    
    it("should not notify 'add' when a node is updated", function() {
      var x = wm.supernode(), calls = 0;
      x.set(x);
      x.on('add', function() {
        ++calls;
      });
      x.set(x, 'x');
      demand(calls).equal(0);
    });
    
    it("should notify 'add' and not 'update' when a node is re-added", function() {
      var x = wm.supernode(), adds = 0, updates = 0;
      x.set(x);
      x.remove(x);
      x.on('add', function() {
        ++adds;
      });
      x.on('update', function() {
        ++updates;
      });
      x.set(x, 'x');
      demand(adds).equal(1);
      demand(updates).equal(0);
    });
    
    it("should accept multiple alert types", function() {
      var x = wm.supernode('x'), a = wm.node('a'), calls = 0;
      x.on('add', 'remove', function() {
        ++calls;
      });
      demand(calls).equal(0);
      x.set(a);
      demand(calls).equal(1);
      x.set(a, 'x');
      demand(calls).equal(1);
      x.remove(a);
      demand(calls).equal(2);
    });
    
    it("should accept nonexistent alert types", function() {
      var x = wm.supernode('x');
      x.on('gain self-awareness', function() {  });
    });
    
    it("should handle nonexistent alert types transparently", function() {
      var x = wm.supernode('x'), a = wm.node('a'), calls = 0;
      x.on('add', 'destroy', 'remove', function() {
        ++calls;
      });
      demand(calls).equal(0);
      x.set(a);
      demand(calls).equal(1);
      x.remove(a);
      demand(calls).equal(2);
    });
    
    it("should pass the new node and value to the 'add' listener", function() {
      var x = wm.supernode('x'), a = wm.node('a'), calls = 0, node, value;
      x.on('add', function(n, v) {
        ++calls;
        demand(n).equal(node);
        demand(v).equal(value);
      });
      node = x; value = 'x'; x.set(x, 'x');
      node = a; value = undefined; x.set(a);
      x.remove(x); x.remove(a);
      node = a; value = 12; x.set(a, 12);
      node = x; value = undefined; x.set(x);
      demand(calls).equal(4);
    });
    
    it("should pass the new node and value to the 'update' listener", function() {
      var x = wm.supernode('x'), a = wm.node('a'), calls = 0, node, value;
      x.on('update', function(n, v) {
        ++calls;
        demand(n).equal(node);
        demand(v).equal(value);
      });
      x.set(a, 'x'); x.set(x);
      node = x; value = 'x'; x.set(x, 'x');
      node = a; value = undefined; x.set(a);
      node = a; value = 12; x.set(a, 12);
      node = x; value = undefined; x.set(x);
      demand(calls).equal(4);
    });
    
    it("should pass the old node and value to the 'remove' listener", function() {
      var x = wm.supernode('x'), a = wm.node('a'), calls = 0, node, value;
      x.on('remove', function(n, v) {
        ++calls;
        demand(n).equal(node);
        demand(v).equal(value);
      });
      x.set(x, 'x');
      x.set(a);
      x.set(x);
      x.set(a, 12);
      node = a; value = 12; x.remove(a);
      node = x; value = undefined; x.remove(x);
      demand(calls).equal(2);
    });
    
    it("should notify 'add' symmetrically", function() {
      var x = wm.supernode(), y = wm.supernode(), callsX = 0, callsY = 0;
      x.on('add', function(node, value) {
        ++callsX;
        demand(node).equal(y);
        demand(value).equal('x');
      });
      y.on('add', function(node, value) {
        ++callsY;
        demand(node).equal(x);
        demand(value).equal('x');
      });
      x.set(y, 'x');
      demand(callsX).equal(1);
      demand(callsY).equal(1);
    });
    
    it("should notify 'update' symmetrically", function() {
      var x = wm.supernode(), y = wm.supernode(), callsX = 0, callsY = 0;
      x.on('update', function(node, value) {
        ++callsX;
        demand(node).equal(y);
        demand(value).equal('x');
      });
      y.on('update', function(node, value) {
        ++callsY;
        demand(node).equal(x);
        demand(value).equal('x');
      });
      x.set(y);
      x.set(y, 'x');
      demand(callsX).equal(1);
      demand(callsY).equal(1);
    });
    
    it("should notify 'remove' symmetrically", function() {
      var x = wm.supernode(), y = wm.supernode(), callsX = 0, callsY = 0;
      x.on('remove', function(node, value) {
        ++callsX;
        demand(node).equal(y);
        demand(value).equal('x');
      });
      y.on('remove', function(node, value) {
        ++callsY;
        demand(node).equal(x);
        demand(value).equal('x');
      });
      x.set(y, 'x');
      x.remove(y);
      demand(callsX).equal(1);
      demand(callsY).equal(1);
    });
    
    it("shouldn't notify 'add' until the node has been added", function() {
      var x = wm.supernode('x'), a = wm.node('a'), calls = 0;
      x.on('add', function() {
        ++calls;
        demand(x.getNodes()).eql([a]);
        demand(a.getNodes()).eql([x]);
      });
      x.set(a);
      x.remove(a);
      a.set(x);
      demand(calls).equal(2);
    });
    
    it("shouldn't notify 'update' until the node has been updated", function() {
      var x = wm.supernode('x'), a = wm.node('a'), calls = 0, value;
      x.on('update', function() {
        ++calls;
        demand(x.get(a)).equal(value);
        demand(a.get(x)).equal(value);
      });
      x.set(a);
      value = 'x'; x.set(a, 'x');
      value = undefined; a.set(x);
      demand(calls).equal(2);
    });
    
    it("shouldn't notify 'remove' until the node has been removed", function() {
      var x = wm.supernode('x'), a = wm.node('a'), calls = 0;
      x.on('remove', function() {
        ++calls;
        demand(x.getNodes()).be.empty();
        demand(a.getNodes()).be.empty();
      });
      x.set(a); x.remove(a);
      a.set(x); a.remove(x);
      x.set(a); a.remove(x);
      a.set(x); x.remove(a);
      demand(calls).equal(4);
    });
    
    it("shouldn't notify 'add' or 'update' unless a change has occurred", function() {
      var x = wm.supernode('x'), a = wm.node('a'), calls = 0;
      x.on('add', 'update', function() {
        ++calls;
      });
      x.set(a);
      a.set(x);
      a.set(x, 'x');
      a.set(x, 'x');
      x.set(a, 'x');
      demand(calls).equal(2);
    });
    
    it("shouldn't notify 'remove' unless a change has occurred", function() {
      var x = wm.supernode('x'), a = wm.node('a'), calls = 0;
      x.on('remove', function() {
        ++calls;
      });
      x.remove(a);
      a.remove(x);
      a.set(x);
      a.remove(x);
      x.remove(a);
      a.remove(x);
      x.set(a);
      x.remove(a);
      demand(calls).equal(2);
    });
    
  });
  
});

describe("has", function() {
  
  describe(".all()", function() {
    
    it("should return an array of all nodes linked to all arguments", function() {
      var u = wm.supernode('u'), v = wm.supernode('v'), w = wm.supernode('w'),
          x = wm.supernode('x'), y = wm.supernode('y'), z = wm.supernode('z');
      u.set(w); u.set(x); u.set(y);
      v.set(x); v.set(y); v.set(z);
      demand(wm.has.all(u, v)).be.a.permutationOf([x, y]);
    });
    
    it("should work on plain nodes", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c'),
          d = wm.node('d'), e = wm.node('e'), f = wm.node('f');
      a.set(c); a.set(d); a.set(e);
      b.set(d); b.set(e); b.set(f);
      demand(wm.has.all(a, b)).be.a.permutationOf([d, e]);
    });
    
    it("should work on mixed-type nodes", function() {
      var a = wm.node('a'),      b = wm.node('b'),      c = wm.node('c'),
          x = wm.supernode('x'), y = wm.supernode('y'), z = wm.supernode('z');
      a.set(b); a.set(c); a.set(y);
      x.set(c); x.set(y); x.set(z);
      demand(wm.has.all(a, x)).be.a.permutationOf([c, y]);
    });
    
    it("should handle an array as an argument", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c'),
          d = wm.node('d'), e = wm.node('e'), f = wm.node('f');
      a.set(c); a.set(d); a.set(e);
      b.set(d); b.set(e); b.set(f);
      demand(wm.has.all([a, b])).be.a.permutationOf([d, e]);
    });
    
    it("should handle a single argument", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c');
      a.set(b); a.set(c);
      demand(wm.has.all(a)).be.a.permutationOf([b, c]);
    });
    
    it("shouldn't return its argument's nodes array", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c');
      a.set(b); a.set(c);
      demand(wm.has.all(a)).not.equal(a.getNodes());
    });
    
    it("should handle more than 2 arguments", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c'),
          d = wm.node('d'), e = wm.node('e'), f = wm.node('f');
      a.set(d); a.set(e);
      b.set(d); b.set(e);
      c.set(f); c.set(e);
      demand(wm.has.all(a, b, c)).be.a.permutationOf([e]);
    });
    
    it("should output its inputs when appropriate", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c');
      a.set(a); a.set(b); a.set(c);
      b.set(a); b.set(c);
      demand(wm.has.all(a, b)).be.a.permutationOf([a, c]);
    });
    
    it("should return an empty array when appropriate", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c');
      a.set(b); a.set(c);
      b.set(a);
      demand(wm.has.all(a, b)).be.empty();
    });
    
  });
  
  describe(".any()", function() {
    
    it("should return an array of all nodes linked to any argument", function() {
      var u = wm.supernode('u'), v = wm.supernode('v'), w = wm.supernode('w'),
          x = wm.supernode('x'), y = wm.supernode('y'), z = wm.supernode('z');
      u.set(w); u.set(x);
      v.set(y); v.set(z);
      demand(wm.has.any(u, v)).be.a.permutationOf([w, x, y, z]);
    });
    
    it("should work on plain nodes", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c'),
          d = wm.node('d'), e = wm.node('e'), f = wm.node('f');
      a.set(c); a.set(d);
      b.set(e); b.set(f);
      demand(wm.has.any(a, b)).be.a.permutationOf([c, d, e, f]);
    });
    
    it("should work on mixed-type nodes", function() {
      var a = wm.node('a'),      b = wm.node('b'),      c = wm.node('c'),
          x = wm.supernode('x'), y = wm.supernode('y'), z = wm.supernode('z');
      a.set(b); a.set(c);
      x.set(y); x.set(z);
      demand(wm.has.any(a, x)).be.a.permutationOf([b, c, y, z]);
    });
    
    it("should handle an array as an argument", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c'),
          d = wm.node('d'), e = wm.node('e'), f = wm.node('f');
      a.set(c); a.set(d);
      b.set(e); b.set(f);
      demand(wm.has.any([a, b])).be.a.permutationOf([c, d, e, f]);
    });
    
    it("should handle no arguments", function() {
      demand(wm.has.any()).be.empty();
    });
    
    it("should handle a single argument", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c');
      a.set(b); a.set(c);
      demand(wm.has.any(a)).be.a.permutationOf([b, c]);
    });
    
    it("shouldn't return its argument's nodes array", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c');
      a.set(b); a.set(c);
      demand(wm.has.any(a)).not.equal(a.getNodes());
    });
    
    it("should handle more than 2 arguments", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c'),
          d = wm.node('d'), e = wm.node('e'), f = wm.node('f');
      a.set(d);
      b.set(e);
      c.set(f);
      demand(wm.has.any(a, b, c)).be.a.permutationOf([d, e, f]);
    });
    
    it("shouldn't duplicate entries", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c'),
          d = wm.node('d'), e = wm.node('e'), f = wm.node('f');
      a.set(c); a.set(d); a.set(e);
      b.set(d); b.set(e); b.set(f);
      demand(wm.has.any(a, b)).be.a.permutationOf([c, d, e, f]);
    });
    
    it("should output its inputs when appropriate", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c'),
          d = wm.node('d');
      a.set(a); a.set(b);
      b.set(c);
      c.set(d);
      demand(wm.has.any(a, b, c)).be.a.permutationOf([a, b, c, d]);
    });
    
    it("should return an empty array when appropriate", function() {
      var a = wm.node('a'), b = wm.node('b'), c = wm.node('c');
      demand(wm.has.any(a, b, c)).be.empty();
    });
    
  });
  
  describe(".andNot()", function() {
    
    it("should return an array of all nodes linked to yes and not no", function() {
      var yes = wm.supernode('yes'), no = wm.supernode('no'),
          x = wm.supernode('x'), y = wm.supernode('y'), z = wm.supernode('z');
      yes.set(x); yes.set(y);
      no.set(y); no.set(z);
      demand(wm.has.andNot(yes, no)).be.a.permutationOf([x]);
    });
    
    it("should work on plain nodes", function() {
      var yes = wm.node('yes'), no = wm.node('no'),
          a = wm.node('a'), b = wm.node('b'), c = wm.node('c');
      yes.set(a); yes.set(b);
      no.set(b); no.set(c);
      demand(wm.has.andNot(yes, no)).be.a.permutationOf([a]);
    });
    
    it("should work on mixed-type nodes", function() {
      var yes = wm.supernode('yes'), no = wm.node('no'),
          x = wm.supernode('x'), y = wm.supernode('y'),
          a = wm.node('a'), b = wm.node('b');
      yes.set(x); yes.set(y); yes.set(a);
      no.set(y); no.set(b);
      demand(wm.has.andNot(yes, no)).be.a.permutationOf([x, a]);
    });
    
    it("shouldn't return yes's nodes array", function() {
      var yes = wm.node('yes'), no = wm.node('no'),
          a = wm.node('a'), b = wm.node('b');
      yes.set(a); yes.set(b);
      demand(wm.has.andNot(yes, no)).not.equal(yes.getNodes());
    });
    
    it("should output its inputs when appropriate", function() {
      var yes = wm.node('yes'), no = wm.node('no'),
          a = wm.node('a'), b = wm.node('b');
      yes.set(yes); yes.set(a); yes.set(b);
      no.set(no); no.set(a);
      demand(wm.has.andNot(yes, no)).be.a.permutationOf([yes, b]);
    });
    
    it("should return an empty array when yes has no nodes", function() {
      var yes = wm.node('yes'), no = wm.node('no');
      demand(wm.has.andNot(yes, no)).be.empty();
    });
    
    it("should return an empty array when no has all of yes's nodes", function() {
      var yes = wm.node('yes'), no = wm.node('no'),
          a = wm.node('a'), b = wm.node('b');
      yes.set(a); yes.set(b);
      no.set(b); no.set(a);
      demand(wm.has.andNot(yes, no)).be.empty();
    });
    
    it("should handle yes and no with no overlap", function() {
      var yes = wm.node('yes'), no = wm.node('no'),
          a = wm.node('a'), b = wm.node('b');
      yes.set(a);
      no.set(b);
      demand(wm.has.andNot(yes, no)).be.a.permutationOf([a]);
    });
    
  });
  
});
