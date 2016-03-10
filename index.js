/**
 * @module List
 * @author lzhengms <lzhengms@gmail.com>
 */

'use strict'

var $ = require('nd-jquery')
var __ = require('nd-i18n')
var Base = require('nd-base')
var debug = require('nd-debug')
var Promise = require('nd-promise')

var List = Base.extend({

  attrs: {
    proxy: null,
    params: {
      $count: true
    },
    data: null,
    list: [],
    // 列表字段名
    dataKey: 'items',
    // 过滤数据
    inFilter: function(data) {
      return data
    },
    // 过滤数据
    outFilter: function(data) {
      return data
    }
  },

  initialize: function(config) {
    List.superclass.initialize.call(this, config)

    var proxy = this.get('proxy')

    if (!proxy) {
      debug.log(__('请设置数据源（proxy）'))
    } else {
      if (proxy.LIST) {
        this.LIST = proxy.LIST.bind(proxy)
      } else if (!proxy.LIST) {
        this.LIST = function() {
          debug.log(__('数据源（proxy）缺少`LIST`方法'))
          return Promise.resolve({})
        }
      }
    }

    this.set('params', $.extend(this._getParams(0), this.get('params')))

    // 取列表
    this.getList()
  },

  _getParams: function(count, params) {
    if (count || typeof count === 'undefined') {
      return {
        $offset: params.$offset + params.$limit
      }
    }

    return {
      $limit: 100,
      $offset: 0
    }
  },

  getList: function(options) {
    var that = this

    if (options && options.data) {
      this.set('params', options.data)
    } else {
      options = {}
    }

    var params = options.data =
      this.get('inFilter').call(this, $.extend({}, this.get('params')))

    Object.keys(params).forEach(function(key) {
      // 空字符串不提交查询
      if (params[key] === '') {
        delete params[key]
      }
    })

    this.LIST(options)
      .then(function(data) {
        data = that.get('outFilter').call(that, data)

        var dataKey = that.get('dataKey')
        var size = data[dataKey].length

        if (!size) {
          return that.trigger('drain')
        }

        // all items loaded
        var sofar = that.pushItems(data[dataKey])

        if (size < params.$limit) {
          return that.trigger('drain')
        }

        if (typeof data.count === 'undefined') {
          if (data.total) {
            data.count = data.total
          }
        }

        if (data.count === sofar) {
          return that.trigger('drain')
        }

        that.getList({
          data: that._getParams(data.count, params)
        })
      }).catch(function(error) {
        debug.error(error)
      })
  },

  pushItems: function(items) {
    var list = this.get('list').concat(items)

    this.set('list', list, {
      silent: true,
      override: true
    })

    return list.length
  }

})

module.exports = List
