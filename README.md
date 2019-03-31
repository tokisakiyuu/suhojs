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
require({loader: "loader/HtmLoader.js"});

let mod1 = require("mod/mod1.js");
let mod2 = require("mod/mod2.js");
let mod5 = require("mod/mod5.js");
let mod6 = require("mod/mod6.js");
let htmMod = require("mod/htmlMod1.html");

console.log(mod5.name);
console.log(mod6.name);
console.log(htmMod);

mod1.foo();
mod2.foo();
```

>没错，模块这样引入： 
>let mod2 = require("mod/mod2.js");
>而自定义loader则是这样：
>require({loader: "loader/HtmLoader.js"});

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

------
#### 3. 自定义loader
那里面有什么
```javascript
defineLoader([".htm", ".html"], {
    //声明raw的类型
    rawType: "text",
    //以编译方式产出
    translate: function(raw, suffix){
        return `
            let div = document.createElement("div");
            div.innerText = "我是以编译方式产出的模块，后缀为：${suffix}"
            export: div;
        `;
    },
    //以实例方式产出
    make: function(raw, suffix){
        let div = document.createElement("div");
        div.innerText = "i'm a module raw by "+ raw;
        return div;
    }
});
```

> loader中目前有两种可供选择的处理函数，函数内部细节由开发者实现，具体用处你可以试试看。如果你的自定义loader中既有**translate**函数，又有**make**函数，suhojs会优先选取**make**函数使用。