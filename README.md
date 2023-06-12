> **初学阶段瞎写的小玩具，仅作留念**

# [suhojs](https://github.com/TokisakiYuu/suhojs)

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yanhaijing/jslib-base/blob/master/LICENSE)

->  一个简单的浏览器端模块加载器

->  模块的引用、导出同nodejs一致

->  可以根据文件后缀名自定义loader




:rocket:快速开始

---

浏览器环境html

```html
<script data-config="suho.config.js" src="suho-v3.0.js"></script>
```

> suho.config.js是配置文件的位置

---




模块的引用和导出

```js
const modA = require("path/to/modA.js");
const modB = require("./path/to/modB");
const modC = require("../to/modC");
const modD = require("https://www.otherstie.com/path/to/modD.js");
const external = require("@external");

module.exports = function foo(){};
exports.va = "hello";
```

> 支持以当前文件路径为根的相对路径引用，带@的是引用第三方模块，后面会说明

---




自定义loader

```js
// 自定义loader必须用module.exports导出一个函数，并且至少有一个参数，这个参数是文件的原始数据
// 这个函数支持同步方式返回，也可以异步方式返回Promise
module.exports = function(source) {
  return "file content:\n" + source;
}
```
> 自定义loader如果返回字符串，suhojs将把字符串当作js代码来处理；如果返回对象，那么这个模块的导出就是这个对象。

---



Configura

```js
let suho = require("suho");

module.exports = {
    entry: "index.js",					// 入口文件
    modules: "/node_modules",   // 第三方模块根目录，引用时的 @ 符号会被替换成这个
    loaders: [
        {
            id: "raw-loader",
            path: "@raw-loader"
        },
        {
            id: "html-loader",
            path: "@html-loader"
        },
        {
            id: "your-loader",
            path: "/src/myloader/your-loader.js"
        }
    ],
    rules: [
        {
            suffix: [".html", ".htm", ".xhtml"],
            rawType: suho.rawType.text,	    // 它决定这些类型的文件的原始数据的类型，实际上是responseType
            useLoader: ["raw-loader", "html-loader"]    // 原始数据会按顺序传给这些loader处理
        },
        {
            suffix: [".yuu"],
            useLoader: ["raw-loader", "your-loader"]
        }
    ]
}
```

> 配置文件也是一个模块，不过目前它只能引用内置模块



:derelict_house:贡献者列表

[good-ideal](https://github.com/good-ideal)

[tokisakiyuu](https://github.com/TokisakiYuu)

:blue_book:LICENSE

[MIT](./LICENSE)
