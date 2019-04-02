modules.set("@loader", function(){
    return function(){
        console.log("我是一个内建模块");
    }
})