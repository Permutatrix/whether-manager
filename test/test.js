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
      demand(a.getNodes()).eql([b]);
      a.set(c);
      demand(a.getNodes()).have.length(2);
      demand(a.getNodes()).include(b);
      demand(a.getNodes()).include(c);
      a.remove(b);
      demand(a.getNodes()).eql([c]);
      a.remove(c);
      demand(a.getNodes()).be.empty();
    });
    
    it("should return a new array on each invocation by default", function() {
      var a = node(), b = node();
      demand(a.getNodes()).not.equal(a.getNodes());
      a.set(b);
      demand(a.getNodes()).not.equal(a.getNodes());
    });
    
    it("should return a new array on each invocation when passed a truthy value", function() {
      var a = node(), b = node();
      demand(a.getNodes(false)).not.equal(a.getNodes(1));
      a.set(b);
      demand(a.getNodes(false)).not.equal(a.getNodes(true));
    });
    
    // there's no test for the inverse because that behavior is undefined.
    
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
  
  describe(".nodes", function() {
    
    it("should be an array of linked nodes", function() {
      var a = node(), b = node(), c = node();
      demand(a.nodes).be.empty();
      a.set(b);
      demand(a.nodes).eql([b]);
      a.set(c);
      demand(a.nodes).have.length(2);
      demand(a.nodes).include(b);
      demand(a.nodes).include(c);
      a.remove(b);
      demand(a.nodes).eql([c]);
      a.remove(c);
      demand(a.nodes).be.empty();
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
    
    // listeners shouldn't be called until after the change is applied
    // listeners should only be called when a change actually occurs
    
  });
  
});
