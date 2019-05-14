


/**
 * 生成自定义模块(loader/config等)
 */
function generateCustomModule(task, retModule){
    // console.log(task);
    //如果用户请求定义loader
    if(task.config && task.config.loader){
        fetchResource( task.url, "text", function(raw){
            task.raw = raw;
            retModule(
                defineLoader(task)
            );
        });
        return;
    }
}




/**
 * 定义loader
 * @todo 让每一个内部loader拥有向waiting添加任务的权限
 */
function defineLoader(task){
    let raw = task.raw;
    let format = task.config.loader;
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