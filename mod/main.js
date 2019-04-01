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