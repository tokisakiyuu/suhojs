let mod3 = require("../mod/mod3.js");
let mod4 = require("../mod/mod4.js");
let mod5 = require("../mod/mod5.js");
let mod6 = require("../mod/mod6.js");

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