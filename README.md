# SuhoJs
### 一切资源都是模块
------

#### 1. 入口
在你的html文档头部加入
```html
<script suho-main="path/to/main.js" src="suho.js"></script>
```
------
#### 2. 示例：main.js(或者其它名字)

```javascript
let mod1 = require("mod/mod1.js");
let mod2 = require("mod/mod2.js");
let mod5 = require("mod/mod5.js");
let mod6 = require("mod/mod6.js");
let htmMod = require("mod/htmlMod1.html");

console.log(mod5.name);
console.log(mod6.name);
// 返回html字符串
console.log(htmMod);

mod1.foo();
mod2.foo();
```

>没错，模块这样引入： 
>let mod2 = require("mod/mod2.js");

------
#### 3.示例：mod1.js
```javascript
let mod3 = require("mod/mod3.js");
let mod4 = require("mod/mod4.js");
let mod5 = require("mod/mod5.js");
let mod6 = require("mod/mod6.js");

console.log("mod1里面的mod5："+mod5.name);
console.log("mod1里面的mod6："+mod6.name);

export: {
    foo: function(){
        console.log("mod1 {");
        mod3.foo();
        mod4.foo();
        console.log("}")
    }
}
```
> **export:**
关键字是导出