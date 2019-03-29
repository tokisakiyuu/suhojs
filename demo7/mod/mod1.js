import mod2 from "mod/mod2.js";
import mod3 from "mod/mod3.js";
import mod5 from "mod/mod5.js";

let mod1 = {
    foo: function(){
        console.log("call mod2.foo");
        mod2.foo();
        console.log("call mod3.foo");
        mod3.foo();
    }
}

export mod1;