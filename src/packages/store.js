/**
 * 模块仓库。
 * 它用来存放已经被加载的模块，这里的模块全部都已经准备就绪了。
 * 模块是以键值对的形式存放的，便于在取用时快速响应，形式是 {url -> Module}
 * "url"是指模块的网络地址，Module是指一个内建的模块对象
 */
let modules = new Map();


/**
 * 别名表。
 * 为模块创建的别名储存在此，require函数引入模块时优先查找这里的键
 */
let alias = new Map();


/**
 * loader仓库
 */
let loaders = new Map();





//内置: .js文件loader
(function(l){
    /**
     * 获得window的所有属性
     */
    let globalAllProp = Object.getOwnPropertyNames(self);
    let orginaRequire = globalAllProp.indexOf("require");
    if(orginaRequire >= 0){
        globalAllProp.splice(orginaRequire, 1);
    }
    let shadArgs = globalAllProp.join(",");




    /**
     * 解析模块源码，收集必要信息，返回一个构造完毕的模块
     * 一个构造完毕的模块实质上是一个匿名函数，返回值是该模块的导出，且这个函数有且只有一个参数，参数名必须是 "require"
     */
    function compile(task){
        let raw = exportStatment(task.raw);
        let depends = getDepend(raw);
        task.depends = depends;
        return new Function("require" + "                           /* "+ task.url +" */", raw);
    }



    /**
     * 收集模块源码中的依赖。忽略收集过程中的错误
     */
    function getDepend(raw){
        let depends = [];
        let gatherFn = preCheckCode(raw);
        try {
            gatherFn(
                function findDepend(sign, config){
                    depends.push({sign: sign, config: config});
                }
            );
        } catch (_) {};
        return depends;
    }




    /**
     * 执行语法检查
     */
    function preCheckCode(raw){
        return new Function("require," + shadArgs, raw);
    }



    /**
     * 处理导出语句
     */
    function exportStatment(raw){
        return raw.replace("export:", "return");
    }

    l.set(".js", {
        responseType: "text",
        format: ".js",
        normalExport: null,
        make: function(task){
            return compile(task);
        }
    });
}(loaders));