# [suhojs](https://github.com/TokisakiYuu/suhojs)

一个简单的浏览器端模块加载器，仿nodejs require，可自定义loader。

:star:特性

---

+ 支持nodejs require方式引入模块
+ 可根据文件后缀自定义loader
+ 支持引入跨域模块
+ 可手动集成内置模块​

:rocket:快速开始

---

通过git下载代码

```js
git clone https://github.com/TokisakiYuu/suhojs.git
```

浏览器环境下

```html
<script suho-main="path/to/main.js" src="dist/suho.js"></script>
```

在你自己定义的main.js文件中

```js
const modA = require("path/to/modA.js");
const modB = require("https://cdn.yourstie.com/path/to/modB.js");
```

> 注：如果你引入的文件后缀是`.js`，那么可省略后缀名不写
>
> `require("path/to/modA")` :ok_hand:

关于自定义loader

```js
// loader实际上也是一个模块
// 但此模块的输出必须包含用于处理文件内容的make函数和用来制定文件后缀名的type变量
function foo(raw){
  return mod;
}
exports.make = foo;
exports.type = ".html";
```

> 注：suhojs会在需要时执行make函数，并传入这个html文件的源代码`raw`

> 注：make函数的返回值`mod`可以是任何类型的对象，在require这个模块时会返回这个对象，但当`mod`是一个函数时，它将被当作此类型的模块的构造函数，在require时会先instance，再返回，如下所示

当make函数是一个高阶函数时[^?]

```js
// htmlLoader.js
function foo(raw){
  return (require, exports) => {
    const div = document.createElement("div");
    div.innerHTML = raw;
    return div;
  };
}
export.make = foo;
export.type = ".html";

// main.js
require("{loader}path/to/htmlLoader");
const div1 = require("path/to/banner.html");
const div2 = require("path/to/banner.html");
div1 === div2; // false
```



:derelict_house:贡献者列表

[good-ideal](https://github.com/good-ideal)

[tokisakiyuu](https://github.com/TokisakiYuu)

:gear:TODO

- 全局配置文件
- 动态引入模块
- 性能优化

:bulb:谁在使用

- ~~Chrome~~
- ~~vscode~~
- ~~ECMAScript~~
- 我自己，感觉良好

:blue_book:LICENSE

[MIT](./LICENSE)



[^?]:高阶函数: 返回函数的函数



