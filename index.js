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
      $count: true,
      $limit: 100
    },
    data: null
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

    this.set('params', $.extend((function(mode) {
      switch (mode) {
        // case 2:
        //   return {};
        case 1:
          return {
            $count: true,
            size: 10,
            page: 0
          };
        default:
          return {
            $count: true,
            $limit: 10,
            $offset: 0
          };
      }
    })(this.get('mode')), this.get('params')));

    // 取列表
    this.getList();
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
      if (!data.count && data.items.length) {
        //没有分页的情况，没有返回data.count
        data.count = data.items.length;
      }

      if (data.count && data.items.length) {
        that.set('data', data.items);

        var nowTotal = (function(mode) {
          switch (mode) {
            // case 2:
            //   return {};
            case 1:
              return ++params.page * params.size;
            default:
              return params.$offset + params.$limit;
          }
        })(that.get('mode'));

        if (data.count > nowTotal) {
          that.getList({
            data: (function(mode) {
              switch (mode) {
                // case 2:
                //   return {};
                case 1:
                  return {
                    page: Math.ceil(data.count / params.size) - 1
                  };
                default:
                  return {
                    $offset: (Math.ceil(data.count / params.$limit) - 1) * params.$limit
                  };
              }
            })(that.get('mode'))
          });
        } else {
          that.trigger('loaded', that.get('list'));
        }
      } else {
        that.trigger('drain');
      }

    }).fail(function(error) {
      debug.error(error);
    });
  },

  _onChangeData: function(data) {
    this.set('list', (this.get('list') || []).concat(data));
  }

});


module.exports = List;
