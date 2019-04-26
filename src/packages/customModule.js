/**
 * loader仓库
 */
const loaders = new Map();


/**
 * 生成自定义模块
 */
function generateCustomModule(task, retModule){
    //如果用户请求定义loader
    if(task.config && task.config.loader){
        fetchResource( task.url, "text", function(raw){
            retModule(
                defineLoader(raw, task.config.loader)
            );
        });
        return;
    }

    //尝试获取loader
    let loader = loaders.get(task.type);

    //如果没有对应的loader，就返回 字符串模块
    if(!loader){
        fetchResource( task.url, "text", function(raw){
            retModule(
                raw
            );
        });
        return;
    }

    //如果有对应的loader，用loader解释后返回模块
    fetchResource( task.url, loader.responseType, function(res){
        let dist = null;
        try { dist = loader.make(res); } 
        catch (error) {
            console.error(error);
        }
        retModule(
            dist
        );
    });
}




/**
 * 定义loader
 * @todo 让每一个内部loader拥有向waiting添加任务的权限
 */
function defineLoader(raw, format){
    //用于收集调节参数的对象
    let collect = {
        __proto__: null,

        responseType: "text",
        format: format,
        make: function(_){ return _ },
        normalExport: null
    };
    //构造
    let defFn = new Function("$set", raw);
    defFn(collect);
    //存储loader
    format = collect.format;
    if(typeof format === "string"){
        loaders.set(format, collect);
    }
    if(format instanceof Array){
        format.forEach(function(f){
            loaders.set(f, collect);
        });
    }
    return collect.normalExport;
}