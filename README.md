# [suhojs](https://github.com/TokisakiYuu/suhojs)

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yanhaijing/jslib-base/blob/master/LICENSE)

->  一个简单的浏览器端模块加载器

->  模块的引用、导出同nodejs一致

->  可以根据文件后缀名自定义loader




:rocket:快速开始

---

浏览器环境html

```html
<script data-main="index.js" src="dist/suho.js"></script>
```

> index.js是入口




模块的引用和导出

```js
const modA = require("path/to/modA.js");
const modB = require("path/to/modB");
const modC = require("https://www.otherstie.com/path/to/modC.js");
// 引入loader不是立即生效，而是要等到引用loader的模块和loader所依赖的模块全部加载完才会生效
const htmlLoader = require("{loader!html}path/to/html-loader.js");
```

> 模块路径是相对路径的话是以当前html文件的url为根




自定义loader

```js
// loader实际上也是一个模块，可以引用其它模块，但依赖关系过多可能会导致loader还没加载完所有的依赖就开始被调用而报错
let modA = require("path/to/modA")

// 自定义loader必须用module.exports导出一个函数，并且至少有一个参数
// 这个函数只支持Promise异步返回
module.exports = function(source) {
  // source实际上是一个fetch("xxx.xx")返回的一个Response对象
  return source.blob();
}
```
> 自定义loader如果返回字符串，suhojs将把字符串当作js代码来处理；如果返回对象，那么这个模块的导出就是这个对象。



:derelict_house:贡献者列表

[good-ideal](https://github.com/good-ideal)

[tokisakiyuu](https://github.com/TokisakiYuu)

:blue_book:LICENSE

[MIT](./LICENSE)