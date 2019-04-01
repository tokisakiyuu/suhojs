let mod3 = require("mod/mod3.js");
let mod4 = require("mod/mod4.js");

export: {
    foo: function(){
        console.log("mod2 {");
        mod3.foo();
        mod4.foo();
        console.log("}")
    }
}