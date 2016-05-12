# nd-list

[![Travis](https://img.shields.io/travis/ndfront/nd-list.svg?style=flat-square)](https://github.com/ndfront/nd-list)
[![Coveralls](https://img.shields.io/coveralls/ndfront/nd-list.svg?style=flat-square)](https://github.com/ndfront/nd-list)
[![NPM version](https://img.shields.io/npm/v/nd-list.svg?style=flat-square)](https://npmjs.org/package/nd-list)

> repeat request list

## 安装

```bash
$ spm install nd-list --save
```

## 使用

```js
var List = require('nd-list');
// use List
new List({
  proxy: new SomeModel({...})
}).on('drain', function() {
  console.log(this.get('list'));
});
```
