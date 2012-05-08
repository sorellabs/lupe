var ensure = require('noire').ensure
var sinon = require('sinon')
var _ = require('../src/core')

describe('[] NodeList', function() {

  function even(x){ return x % 2 == 0 }

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

  describe('λ reduce', function() {
    it('Should apply folder to each item in the list.', function() {
      var stub = sinon.stub().returnsArg(1)
      n.append(1).append(2).append(3).reduce(0, stub)
      ensure(stub).property('callCount').same(3)
      ensure(stub).invoke('calledWithExactly', 0, 1, 0, n).ok()
      ensure(stub).invoke('calledWithExactly', 1, 2, 1, n).ok()
      ensure(stub).invoke('calledWithExactly', 2, 3, 2, n).ok()
    })
    it('Given an initial value, should use it as as the starting accumulator.', function() {
      var stub = sinon.stub()
      n.append(1).reduce(0, stub)
      ensure(stub).invoke('calledWithExactly', 0, 1, 0, n).ok()
    })
    it('Given no initial value, should use first item in sequence as accumulator.', function() {
      var stub = sinon.stub()
      n.append(1).append(2).reduce(stub)
      ensure(stub).invoke('calledWithExactly', 1, 2, 1, n).ok()
    })
    it('Should use the return value for the next iteration\'s accumulator.', function() {
      var stub = sinon.stub().returnsArg(1)
      n.append(1).append(2).reduce(0, stub)
      ensure(stub).invoke('calledWithExactly', 0, 1, 0, n).ok()
      ensure(stub).invoke('calledWithExactly', 1, 2, 1, n).ok()
    })
    it('Should return the accumulated value.', function() {
      var stub = sinon.stub().returnsArg(1)
      n.append(1).append(2).reduce(0, stub)
      ensure(stub).invoke('calledWithExactly', 0, 1, 0, n).ok()
      ensure(stub).invoke('calledWithExactly', 1, 2, 1, n).ok()
      ensure(n.reduce(0, stub)).same(2)
    })
  })

  describe('λ reduce', function() {
    it('Should apply folder to each item in the list.', function() {
      var stub = sinon.stub().returnsArg(1)
      n.append(1).append(2).append(3).reduce_right(0, stub)
      ensure(stub).property('callCount').same(3)
      ensure(stub).invoke('calledWithExactly', 0, 3, 2, n).ok()
      ensure(stub).invoke('calledWithExactly', 3, 2, 1, n).ok()
      ensure(stub).invoke('calledWithExactly', 2, 1, 0, n).ok()
    })
    it('Given an initial value, should use it as as the starting accumulator.', function() {
      var stub = sinon.stub()
      n.append(1).reduce_right(0, stub)
      ensure(stub).invoke('calledWithExactly', 0, 1, 0, n).ok()
    })
    it('Given no initial value, should use first item in sequence as accumulator.', function() {
      var stub = sinon.stub()
      n.append(1).append(2).reduce_right(stub)
      ensure(stub).invoke('calledWithExactly', 2, 1, 0, n).ok()
    })
    it('Should use the return value for the next iteration\'s accumulator.', function() {
      var stub = sinon.stub().returnsArg(1)
      n.append(1).append(2).reduce_right(0, stub)
      ensure(stub).invoke('calledWithExactly', 0, 2, 1, n).ok()
      ensure(stub).invoke('calledWithExactly', 2, 1, 0, n).ok()
    })
    it('Should return the accumulated value.', function() {
      var stub = sinon.stub().returnsArg(1)
      n.append(1).append(2).reduce_right(0, stub)
      ensure(stub).invoke('calledWithExactly', 0, 2, 1, n).ok()
      ensure(stub).invoke('calledWithExactly', 2, 1, 0, n).ok()
      ensure(n.reduce_right(0, stub)).same(1)
    })
  })

  describe('λ every', function() {
    it('Should apply predicate to each item in the list.', function() {
      var stub = sinon.stub().returns(true)
      n.append(1).append(2).append(3).every(stub)
      ensure(stub).invoke('calledWithExactly', 1, 0, n).ok()
      ensure(stub).invoke('calledWithExactly', 2, 1, n).ok()
      ensure(stub).invoke('calledWithExactly', 3, 2, n).ok()
    })
    it('Should return `false` as soon as the predicate fails.', function() {
      var stub = sinon.stub().returns(false)
      ensure(n.append(1).append(2).every(stub)).not().ok()
      ensure(stub).property('callCount').same(1)
    })
    it('Should return `true` if all items pass.', function() {
      var stub = sinon.stub().returns(true)
      ensure(n.append(1).append(2).every(stub)).ok()
      ensure(stub).property('callCount').same(2)
    })
  })

  describe('λ some', function() {
    it('Should apply predicate to all items in the list.', function() {
      var stub = sinon.stub().returns(false)
      n.append(1).append(2).append(3).some(stub)
      ensure(stub).invoke('calledWithExactly', 1, 0, n).ok()
      ensure(stub).invoke('calledWithExactly', 2, 1, n).ok()
      ensure(stub).invoke('calledWithExactly', 3, 2, n).ok()
    })
    it('Should return `true` as soon as the predicate holds.', function() {
      var stub = sinon.stub().returns(true)
      ensure(n.append(1).append(2).some(stub)).ok()
      ensure(stub).property('callCount').same(1)
    })
    it('Should return `false` if all items fail.', function() {
      var stub = sinon.stub().returns(false)
      ensure(n.append(1).append(2).some(stub)).not().ok()
      ensure(stub).property('callCount').same(2)
    })
  })

  describe('λ filter', function() {
    it('Should apply filter to each item in the list.', function() {
      var stub = sinon.stub()
      n.append(1).append(2).append(3).filter(stub)
      ensure(stub).property('callCount').same(3)
    })
    it('Should return a new NodeList with the items that passed the predicate.', function() {
      var x = n.append(1).append(2).append(3).filter(even)
      ensure(x).property('_children').equals([2])
      ensure(n).property('_children').equals([1,2,3])
    })
  })

  describe('λ map', function() {
    it('Should apply mapping to each item in the list.', function() {
      var stub = sinon.stub()
      n.append(1).append(2).append(3).map(stub)
      ensure(stub).property('callCount').same(3)
    })
    it('Should return a new NodeList with all items transformed by the mapping.', function() {
      var x = n.append(1).append(2).append(3).map(even)
      ensure(x).property('_children').equals([false, true, false])
      ensure(n).property('_children').equals([1, 2, 3])
    })
  })

  describe('λ toString', function() {
    it('Should return a representation of all childrens as one string.', function() {
      n.append(1).append(2).append(3)
      ensure(n.toString()).same('123')
    })
  })
})


describe('{} Node', function() {



})