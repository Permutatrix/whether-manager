var demand = require('must');
var wm = require('..');

describe("Nodes", function() {
  
  it("should be linked symmetrically", function() {
    var a = wm.node(), b = wm.node();
    a.set(b, 'x');
    demand(a.has(b)).be.true();
    demand(b.has(a)).be.true();
    demand(a.get(b)).equal('x');
    demand(b.get(a)).equal('x');
  });
  
  it("should be unlinked symmetrically", function() {
    var a = wm.node(), b = wm.node();
    a.set(b, 'x');
    b.remove(a);
    demand(a.has(b)).be.false();
    demand(b.has(a)).be.false();
  });
  
  describe(".set()", function() {
    
    it("should throw when called with a non-node", function() {
      var a = wm.node();
      demand(function() { a.set({}); }).to.throw(/non-node/i);
    });
    
    it("should return true if there's a change", function() {
      var a = wm.node(), b = wm.node();
      demand(a.set(b)).be.true();
      demand(a.set(b, 'x')).be.true();
      demand(a.set(b)).be.true();
    });
    
    it("should return false otherwise", function() {
      var a = wm.node(), b = wm.node();
      a.set(b);
      demand(a.set(b)).be.false();
      a.set(b, 'x');
      demand(a.set(b, 'x')).be.false();
    });
    
  });
  
  describe(".remove()", function() {
    
    it("should return true if there's a change", function() {
      var a = wm.node(), b = wm.node();
      a.set(b);
      demand(a.remove(b)).be.true();
      a.set(b, 'x');
      demand(a.remove(b)).be.true();
    });
    
    it("should return false otherwise", function() {
      var a = wm.node(), b = wm.node();
      demand(a.remove(b)).be.false();
      a.set(b, 'x');
      a.remove(b);
      demand(a.remove(b)).be.false();
    });
    
  });
  
  describe(".has()", function() {
    
    it("should return true if the nodes are linked", function() {
      var a = wm.node(), b = wm.node();
      a.set(b);
      demand(a.has(b)).be.true();
    });
    
    it("should return false otherwise", function() {
      var a = wm.node(), b = wm.node();
      demand(a.has(b)).be.false();
      a.set(b);
      a.remove(b);
      demand(a.has(b)).be.false();
    });
    
  });
  
  describe(".get()", function() {
    
    it("should return the nodes' link value", function() {
      var a = wm.node(), b = wm.node();
      a.set(b, 'x');
      demand(a.get(b)).equal('x');
    });
    
    it("should return undefined if the nodes aren't linked", function() {
      var a = wm.node(), b = wm.node();
      demand(a.get(b)).be.undefined();
      a.set(b, 'x');
      a.remove(b);
      demand(a.get(b)).be.undefined();
    });
    
    it("should return undefined if the nodes' link value is undefined", function() {
      var a = wm.node(), b = wm.node();
      a.set(b);
      demand(a.get(b)).be.undefined();
    });
    
  });
  
  describe(".getNodes()", function() {
    
    it("should return an array of linked nodes", function() {
      var a = wm.node(), b = wm.node(), c = wm.node();
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
      var a = wm.node(), b = wm.node();
      demand(a.getNodes()).not.equal(a.getNodes());
      a.set(b);
      demand(a.getNodes()).not.equal(a.getNodes());
    });
    
    it("should return a new array on each invocation when passed a truthy value", function() {
      var a = wm.node(), b = wm.node();
      demand(a.getNodes(false)).not.equal(a.getNodes(1));
      a.set(b);
      demand(a.getNodes(false)).not.equal(a.getNodes(true));
    });
    
    // there's no test for the inverse because that behavior is undefined.
    
  });
  
  describe(".name", function() {
    
    it("should be equal to the passed-in name", function() {
      var a = wm.node('a'), b = wm.node('b');
      demand(a.name).equal('a');
      demand(b.name).equal('b');
    });
    
    it("should be undefined if no name is given", function() {
      var a = wm.node();
      demand(a.name).be.undefined();
    });
    
  });
  
  describe(".nodes", function() {
    
  });
  
});
