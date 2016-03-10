'use strict'

// var $ = require('nd-jquery')
var expect = require('chai').expect
var List = require('../index')

/*globals describe,it*/

describe('List', function() {

  it('new List', function() {
    expect(List).to.be.a('function')
    expect(new List).to.be.a('object')
  })

})
