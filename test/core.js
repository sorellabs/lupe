var ensure = require('noire').ensure
var sinon = require('sinon')
var _ = require('../src/core')

describe('[] NodeList', function() {

  var n, node
  beforeEach(function() {
    n    = _.NodeList.make()
    node = { parent: {}, detach: function(){ } }
  })

  describe('λ init', function() {
    it('Given no arguments (or null/undef), should initialise as an empty NodeList.', function() {
      var n = _.NodeList.make()
      ensure(n).property('_children').equals([])
    })
    it('Given an array, should use that array as the list of nodes.', function() {
      var x = [1, 2, 3]
      var n = _.NodeList.make(x)
      ensure(n).property('_children').same(x)
    })
    it('Given an array-like, should cast it over to an array.', function() {
      var n = _.NodeList.make('foo')
      ensure(n).property('_children').equals(['f','o','o'])
    })
  })

  describe('λ append', function() {
    it('Should add the children to the end of the list.', function() {
      n.append(1).append(2)
      ensure(n).property('_children').equals([1, 2])
    })
    it('Should detach the children from their previous parents.', function() {
      var mock = sinon.mock(node).expects('detach').once()
      n.append(node)
      mock.verify()
    })
  })

  describe('λ prepend', function() {
    it('Should add the children to the start of the list.', function() {
      n.prepend(1).prepend(2)
      ensure(n).property('_children').equals([2, 1])
    })
    it('Should detach the children from their previous parents.', function() {
      var mock = sinon.mock(node).expects('detach').once()
      n.prepend(node)
      mock.verify()
    })
  })

  describe('λ insert', function() {
    it('Should add the children to the specified position in the list.', function() {
      n.append(1).append(2).insert(1, 1.5)
      ensure(n).property('_children').equals([1, 1.5, 2])
    })
    it('Shouldn\'t create sparseness.', function() {
      n.append(1).insert(10, 2)
      ensure(n).property('_children').equals([1, 2])
      ensure(n._children.length).same(2)
    })
    it('Should detach the children from their previous parents.', function() {
      var mock = sinon.mock(node).expects('detach').once()
      n.insert(1, node)
      mock.verify()
    })
  })

  describe('λ remove', function() {
    it('Should remove the children from the list.', function() {
      n.append(1).append(2).append(3).append(2).remove(2)
      ensure(n).property('_children').equals([1, 3, 2])
    })
  })

  describe('λ replace', function() {
    it('Should replace the children by the given value, through an ID check.', function() {
      n.append(1).append(node).append(3).replace(node, 0)
      ensure(n).property('_children').equals([1,0,3])
    })
  })

  describe('λ clear', function() {
    it('Should remove all children from the list.', function() {
      n.append(1).append(2).clear()
      ensure(n).property('_children').empty()
    })
    it('Should clear the parent references for the children.', function() {
      n.append(node).clear()
      ensure(node).property('parent').same(null)
    })
  })

  describe('λ at', function() {
    it('Should return the children at the specified position.', function() {
      n.append(1).append(2)
      ensure(n).invoke('at', 1).same(2)
    })
    it('Should return the default value if there\'s no such position.', function() {
      n.append(1).append(2)
      ensure(n).invoke('at', 2).same(undefined)
      ensure(n).invoke('at', 2, 3).same(3)
    })
  })

  describe('λ size', function() {
    it('Should return the number of elements in the list.', function() {
      ensure(n).invoke('size').same(0)
      ensure(n.append(1)).invoke('size').same(1)
    })
  })

  describe('λ empty_p', function() {
    it('Should succeed if the list has no children.', function() {
      ensure(n).invoke('empty_p').ok()
      ensure(n.append(1)).invoke('empty_p').not().ok()
    })
  })

  describe('λ has_p', function() {
    it('Should return true if all children are on the list.', function() {
      n.append(1).append(2)
      ensure(n).invoke('has_p', 1).ok()
      ensure(n).invoke('has_p', 3).not().ok()
    })
  })

  describe('λ find', function() {
    it('Should return the index in which a node can be found in the list.', function() {
      n.append(1).append(1)
      ensure(n).invoke('find', function(){ return true }).same(0)
    })
    it('Should return undefined if the item isn\'t found.', function() {
      n.append(1).append(1)
      ensure(n).invoke('find', function(){ return false }).same(undefined)
    })
  })

  describe('λ find_last', function() {
    it('Should return the last index in which a node can be found in the list.', function() {
      n.append(1).append(1)
      ensure(n).invoke('find_last', function(){ return true }).same(1)
    })
    it('Should return undefined if the item isn\'t found.', function() {
      n.append(1).append(1)
      ensure(n).invoke('find_last', function(){ return false }).same(undefined)
    })
  })


})


describe('{} Node', function() {



})