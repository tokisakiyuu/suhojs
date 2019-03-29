import mod3 from "mod/mod3.js";
import mod4 from "mod/mod4.js";

export default {
    foo: function(){
        console.log("mod2 {");
        mod3.foo();
        mod4.foo();
        console.log("}")
    }
}