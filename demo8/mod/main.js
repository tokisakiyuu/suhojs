// require({loader: "loader/HtmLoader.js", suffix: [".htm", ".html"]});     //设计：loader的引入语法
let mod1 = require("mod/mod1.js");
let mod2 = require("mod/mod2.js");
let mod5 = require("mod/mod5.js");
let mod6 = require("mod/mod6.js");

console.log(mod5.name);
console.log(mod6.name);

mod1.foo();
mod2.foo();