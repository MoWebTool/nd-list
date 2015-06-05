/**
 * @module: nd-list
 * @author: lzhengms <lzhengms@gmail.com> - 2015-05-25 14:34:01
 */

'use strict';

var $ = require('jquery');

var Base = require('nd-base');
var Alert = require('nd-alert');

var List  = Base.extend({
  attrs: {
    proxy: null,
    // 0: mysql or 1: mongodb
    mode: 0,
    title:'',
    params: {
      $count: true,
      $limit: 100
    },
    data: null
  },
  initialize: function (config) {
    List.superclass.initialize.call(this, config);

    var proxy = this.get('proxy');
    if (!proxy) {
      console.error('请设置数据源（proxy）');
    } else {
      this.LIST = proxy['LIST'].bind(proxy);
    }

    var params;

    switch (this.get('mode')) {
      case 2:
        params = {};
        break;
      case 1:
        params = {
          size: 10,
          page: 0
        };
        break;
      default:
        params = {
          $limit: 10,
          $offset: 0
        };
    }

    this.set('params', $.extend(params, this.get('params')));


    // 取列表
    this.getList();

  },
  getList: function (options) {
    var that = this;
    if (options && options.data) {
      this.set('params', options.data);
    } else {
      options = {};
    }
    var params = options.data = $.extend({}, this.get('params'));

    Object.keys(params).forEach(function (key) {
      if (params[key] === '') {
        delete params[key];
      }
    });

    this.LIST(options).done(function (data) {
      if(!data.count && data.items.length){
        //没有分页的情况，没有返回data.count
        data.count=data.items.length;
      }
      if (data.count && data.items.length) {
        that.set('data', data.items);
        var page = params.$offset / params.$limit;
        var nowTotal = that.get('mode') ? ++params.page * params.size : ++page * params.$limit;
        if (data.count > nowTotal) {
          that.getList({
            data: that.get('mode') ? {
              page: params.page
            } : {
              $offset: page * params.$limit
            }
          });
        } else {
          that.trigger('loaded', that.get('list'));
        }
      } else {
        that.trigger('drain');
        Alert.show('没有'+that.get('title')+'数据,请先创建!');
      }

    }).fail(function (error) {
      Alert.show(error);
    });
  },

  _onChangeData: function (data) {
    var doneData = this.get('list') || [];
    doneData = doneData.concat(data);
    this.set('list', doneData);
  }

});


module.exports=List;

