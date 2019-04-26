let pngLoaderNomalExport = require("pngloader", {loader: "hello"});
let img = require("../mod/addr.png");

let mod1 = require("mod1");
let mod2 = require("mod2");
let mod5 = require("mod5");
let mod6 = require("mod6");

console.log(pngLoaderNomalExport);
console.log(img);

console.log(mod5.name);
console.log(mod6.name);

mod1.foo();
mod2.foo();