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
    params: {
      $count: true
    },
    data: null,
    list: [],
    // 列表字段名
    dataKey: 'items',
    // 过滤数据
    inFilter: function(data) {
      return data;
    },
    // 过滤数据
    outFilter: function(data) {
      return data;
    }
  },

  initialize: function(config) {
    List.superclass.initialize.call(this, config);

    var proxy = this.get('proxy');

    if (!proxy) {
      debug.error('请设置数据源（proxy）');
    } else {
      proxy.LIST && (this.LIST = proxy.LIST.bind(proxy));
    }

    this.set('params', $.extend(this._getParams(0), this.get('params')));

    // 取列表
    this.getList();
  },

  _getParams: function(count, params) {
    if (count) {
      return {
        $offset: (Math.ceil(count / params.$limit) - 1) * params.$limit
      };
    }

    if (typeof count === 'undefined') {
      return {
        $offset: params.$offset + params.$limit
      };
    }

    return {
      $limit: 100,
      $offset: 0
    };
  },

  getList: function(options) {
    var that = this;

    if (options && options.data) {
      this.set('params', options.data);
    } else {
      options = {};
    }

    var params = options.data =
      this.get('inFilter').call(this, $.extend({}, this.get('params')));

    Object.keys(params).forEach(function(key) {
      // 空字符串不提交查询
      if (params[key] === '') {
        delete params[key];
      }
    });

    this.LIST(options)
      .done(function(data) {
        data = that.get('outFilter').call(that, data);

        var dataKey = that.get('dataKey');
        var size = data[dataKey].length;

        if (size) {
          if (typeof data.count === 'undefined') {
            data.total && (data.count = data.total);
          }

          if (data.count > that.pushItems(data[dataKey]) ||
            typeof data.count === 'undefined') {
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

    this.set('list', list, {
      silent: true,
      override: true
    });

    return list.length;
  }

});

module.exports = List;
