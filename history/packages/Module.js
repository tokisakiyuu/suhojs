/*!
 * 2019 Yuu
 */



/**
 * 生成模块
 */
let generateModule = function(task, retModule){
    let loader = loaders.get(task.type);
    let url = task.url;
    fetchResource( url, loader.responseType, function(raw){
        task.raw = raw;
        let $ = loader.make(task);
        if(task.depends) addTask(task.depends);
        retModule($);
    });
}



/**
 * 添加任务
 */
function addTask(depends){
    depends.forEach(function(dep){
        let url = compileUrl(dep.sign);
        let levels = url.split("/");
        let fileName = levels.reverse()[0];
        let type = fileName.substr(fileName.lastIndexOf("."));
        dep.fileName = fileName;
        dep.type = type;
        dep.url = url;
        //推入任务队列
        waiting.push(dep);
    });
}




/**
 * 请求获取资源
 */
function fetchResource(url, resourceType, retRaw){
    let xhr = new XMLHttpRequest();
    xhr.responseType = resourceType || "text";
    watchXhr(url, xhr, retRaw);
}




/**
 * 观察ajax请求过程
 */
function watchXhr(url, xhr, retRaw){
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onload = function(){
        let statu = xhr.status;
        if(statu >= 200 && statu < 300 || statu == 304){
            retRaw(xhr.response);
        }else{
            retRaw("");
        }
    }
}





/**
 * error log
 */
function error(msg){
    console.error("[Suho error] " + msg);
}

/**
 * 
 */
function warn(msg){
    console.log("[Suho warn] " + msg);
}


/**
 * 引用继承
 */
function _extend(obj, _from){
    for(let key in _from){
        obj[key] = _from[key];
    }
}




/**
 * 生成标准模块
 * 参数options: { url, sign, fileName, type, depends, config, raw}
 * 参数loader: function
 */
function createModule(options, loader){
    //通过loader获得原始模块，其中包含 依赖项(depends) 和 模块对象(mod)
    let origin = loader(options.raw);
    let depends = origin.depends || [];
    let mod = origin.modFn || function(){};


    // class: 标准模块类
    return new function Module(){
        this.url = options.url;
        this.sign = options.sign;
        this.fileName = options.fileName;
        this.type = options.type;
        this.instance = function(){
            return typeof mod === "function"
                ? mod(requireV2, {})
                : mod;
        }
    }
}



/**
 * 从模块库中取用一个模块 V2
 */
function requireV2(sign, _){
    let module = modules.get(sign);
    return module
        ? module.instance()
        : null;
}
