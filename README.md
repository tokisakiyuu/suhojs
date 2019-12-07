# [suhojs](https://github.com/TokisakiYuu/suhojs)

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yanhaijing/jslib-base/blob/master/LICENSE)

->  一个简单的浏览器端模块加载器

->  模块的引用、导出同nodejs一致

->  可以根据文件后缀名自定义loader，自定loader返回什么这个模块的导出就是什么

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
const htmlLoader = require("{loader!html}path/to/jsloader.js");
```

> 引用的相对路径的话是以当前html文件的url为根

自定义loader

```js
// loader实际上也是一个模块，可以引用其它模块
let modA = require("path/to/modA")

// 自定义loader必须用module.exports导出一个函数，并且至少有一个参数
// 这个函数只支持Promise异步返回
module.exports = function(source) {
  // source实际上是一个fetch("xxx.xx")返回的一个Response对象
  return source.blob();
}
```

:derelict_house:贡献者列表

[good-ideal](https://github.com/good-ideal)

[tokisakiyuu](https://github.com/TokisakiYuu)

:blue_book:LICENSE

[MIT](./LICENSE)