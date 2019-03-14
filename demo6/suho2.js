//通过字符串构建模块，并通过回调输出模块的输出
let execute = function(str, cbk){
    //寻找到要引入的模块并引入
    let modurl = str.substring(0, 3);
    let modjs = str.substring(3, 10);

    //存放当前模块的依赖的输出
    let module = {};

    //循环请求
    fetchMod(modurl, function(modstr, contentLoaded){
        //完成依赖的输出
        execute(modstr, function(exports){
            //把依赖的输出放进存放点
            extend(module, exports);

            //当所有依赖导入完成后
            if(contentLoaded){
                //构建当前模块的完整脚本
                let curr = new Function("module", modjs);
                //执行当前模块的脚本 并且 注入当前模块的所依赖，执行结果成为当前模块的输出
                let exports = curr(module);
                //输出当前模块
                cbk(exports);
            }
        });
    });
}