/**
 * @module List
 * @author lzhengms <lzhengms@gmail.com>
 */

'use strict';

var $ = require('jquery');

var Base = require('nd-base');
var debug = require('nd-debug');

var List = Base.extend({

  attrs: {
    proxy: null,
    // 0: mysql or 1: mongodb
    mode: 0,
    title: '',
    params: {
      $count: true
    },
    data: null,
    list: []
  },

  initialize: function(config) {
    List.superclass.initialize.call(this, config);

    var proxy = this.get('proxy');

    if (!proxy) {
      debug.error('请设置数据源（proxy）');
    } else {
      ['LIST', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE']
      .forEach(function(method) {
        proxy[method] && (this[method] = proxy[method].bind(proxy));
      }, this);
    }

    this.set('params', $.extend(this._getParams(), this.get('params')));

    // 取列表
    this.getList();
  },

  _getParams: function(count, params) {
    if (count) {
      switch (this.get('mode')) {
        case 1:
          return {
            page: Math.ceil(count / params.size) - 1
          };
        default:
          return {
            $offset: (Math.ceil(count / params.$limit) - 1) * params.$limit
          };
      }
    }

    switch (this.get('mode')) {
      case 1:
        return {
          size: 100,
          page: 0
        };
      default:
        return {
          $limit: 100,
          $offset: 0
        };
    }
  },

  getList: function(options) {
    var that = this;

    if (options && options.data) {
      this.set('params', options.data);
    } else {
      options = {};
    }

    var params = options.data = $.extend({}, this.get('params'));

    Object.keys(params).forEach(function(key) {
      if (params[key] === '') {
        delete params[key];
      }
    });

    this.LIST(options).done(function(data) {
      var size = data.items.length;

      if (size) {
        if (data.count > that.pushItems(data.items)) {
          that.getList({
            data: that._getParams(data.count, params)
          });
        } else {
          that.trigger('drain');
        }
      } else {
        that.trigger('drain');
      }

    }).fail(function(error) {
      debug.error(error);
    });
  },

  pushItems: function(items) {
    var list = this.get('list').concat(items);
    this.set('list', list);
    return list.length;
  }

});

module.exports = List;
