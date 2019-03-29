import mod3 from "mod/mod3.js";
import mod4 from "mod/mod4.js";
import mod5 from "mod/mod5.js";
import mod6 from "mod/mod6.js";

console.log("mod1里面的mod5："+mod5.name);
console.log("mod1里面的mod6："+mod6.name);

export default {
    foo: function(){
        console.log("mod1 {");
        mod3.foo();
        mod4.foo();
        console.log("}")
    }
}