/// node.js --- Node implementation
//
// Copyright (c) 2012 Quildreen Motta
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var Base     = require('boo').Base
var seq      = require('khaos').collection.sequence
var map      = require('khaos').collection.map
var format   = require('khaos').collection.string.format
var fun      = require('khaos').functional

var to_array = [].slice.call.bind([].slice)
var array_p  = Array.isArray


function call_predicate(self, predicate) {
  return function(value, key) {
           return predicate(value, key, self) }}


function call_folder(self, predicate) {
  return function(acc, value, key) {
           return predicate(acc, value, key, self) }}


var NodeList = Base.derive({
  init:
  function _init(elements) {
    this._children = !elements?          []
                   : array_p(elements)?  elements
                   : /* otherwise */     to_array(elements)
    return this }

, insert:
  function _insert(index, child) {
    if (child.parent)  child.detach()
    this._children.splice(index, 0, child)
    return this }

, append:
  function _append(child) {
    return this.insert(this._children.length, child) }

, prepend:
  function _prepend(child) {
    return this.insert(0, child) }

, remove:
  function _remove(child) {
    if (child.parent)  child.parent = null
    this._children.splice(this._children.indexOf(child), 1)
    return this }

, replace:
  function _replace(child, value) {
    this.insert(this._children.indexOf(child), value)
    this.remove(child)
    return this }


, clear:
  function _clear(child) {
    this._children.slice().forEach(this.remove.bind(this))
    return this }

, at:
  function _at(index, _default) {
    return index in this._children?  this._children[index]
    :      /* otherwise */           _default }

, put:
  function _put(index, child) {
    this._children.splice(index, 1, child)
    return this }

, size:
  function _size() {
    return this._children.length }

, empty_p:
  function _empty_p() {
    return !this.size() }

, has_p:
  function _has_p(child) {
    return !!~this._children.indexOf(child) }

, find:
  function _find(predicate) {
    return seq.find(this._children, call_predicate(this, predicate)) }

, find_last:
  function _find_last(predicate) {
    return seq.find_last(this._children, call_predicate(this, predicate)) }

, reduce:
  function _reduce(initial, callback) {
    return arguments.length == 1?  seq.reduce(this._children, call_folder(this, initial))
    :      /* otherwise */         seq.reduce(this._children, initial, call_folder(this, callback)) }

, reduce_right:
  function _reduce_right(initial, callback) {
    return arguments.length == 1?  seq.reduce_right(this._children, call_folder(this, initial))
    :      /* otherwise */         seq.reduce_right(this._children, initial, call_folder(this, callback)) }

, filter:
  function _filter(predicate) {
    return NodeList.make(seq.filter(this._children, call_predicate(this, predicate))) }

, map:
  function _map(mapping) {
    return NodeList.make(seq.map(this._children, call_predicate(this, mapping))) }

, some:
  function _some(predicate) {
    return seq.some(this._children, call_predicate(this, predicate)) }

, every:
  function _every(predicate) {
    return seq.every(this._children, call_predicate(this, predicate)) }

, toString:
  function _toString() {
    return this._children.join('') }
})


var Attribute = Base.derive({
  init:
  function _init(name, value) {
    this.name  = name
    this.value = value }

, toString:
  function _toString() {
    return format( '{:name}="{:value}"'
                 , { name:  this.name
                   , value: this.value.toString().replace(/"/g, '\\"') })}
})

var Node = Base.derive({
  init:
  function _init(name, parent) {
    this.name       = name
    this.parent     = parent || null
    this.attributes = {}
    this.children   = NodeList.make()
    return this }


, detach:
  function _detach() {
    this.parent.children.remove(this)
    return this }


, at:
  function _at(name, _default) {
    return name in this.attributes?  this.attributes[name].value
    :      /* otherwise */           _default }


, put:
  function _put(name, value) {
    this.attributes[name] = Attribute.make(name, value)
    return this }


, clone:
  function _clone(deep) {
    var result = Node.make(this.name, this.parent)
    result.attributes = map.map(this.attributes, fun.id)
    result.children   = this.children.map( deep?            clone_child
                                         : /* otherwise */  fun.id)
    return result

    function clone_child(child){ return child.clone(deep) }}


, toString:
  function _toString() {
    return format( '<{:name} {:attributes}>{:children}</{:name}>'
                 , { name:       this.name
                   , attributes: map.values(this.attributes).join(' ')
                   , children:   this.children })}
})


module.exports = { NodeList: NodeList
                 , Node: Node
                 , Attribute: Attribute }