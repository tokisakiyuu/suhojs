/**
 * 构建本地模块仓库
 * 传入入口脚本url，异步返回仓库实例
 */
function buildStore(enterUrl, retStore){
    const store  = new Map(),
          xhr    = new XMLHttpRequest(),
          queue  = [{url: enterUrl, sign: "main"}];
          store.loaders = new Map();
    _fetch(
        xhr,
        queue,
        fulfill   => compile(fulfill, queue, store),
        _         => retStore(store)
    );
}


/**
 * 加载模块
 */
function _fetch(xhr, queue, onNextTick, onClear){
    const task = queue.shift();
    if(!task) return onClear();
    const url = task.url;
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onloadend = () => {
        task.raw = xhr.responseText;
        onNextTick(task);
        _fetch(xhr, queue, onNextTick, onClear);
    };
}



/**
 * 解析源码并构造模块对象
 */
function compile(fulfill, queue, store){
    // 搜集依赖，并生成加载任务
    if(!fulfill.is){
        // 普通模块
        // 构造模块
        const loader = store.loaders.get(getFileType(fulfill.url));
        fulfill.raw = loader && loader.make? loader.make(fulfill.raw) : fulfill.raw;
        const mod = createModule(fulfill.raw, store);
        store.set(fulfill.sign, mod);

        // 收集依赖
        const deps = getDepends(fulfill.raw.toString());
        deps.forEach((sign) => {
            if(store.has(sign)) return;
            // 如果是loader依赖
            if(sign.startsWith("{loader}")){
                // 向队列头部推入一个loader加载任务
                queue.unshift({sign: sign, url: compileUrl(sign), is: "loader"});
            }else{
                queue.push({sign: sign, url: compileUrl(sign)});
            }
        });

    }else if(fulfill.is == "loader"){
        // loader
        const loaderMod = createModule(fulfill.raw, store);
        const ins = loaderMod.instance();
        if(ins.type && ins.make){
            store.loaders.set(ins.type, ins);
        }
    }
}



/**
 * 获取模块中所有的引用模块语句
 */
function getDepends(str){
    var start, end, dep = [];
    start = str.search(/(\b)require[a-zA-Z\s]*\(('|")(.*)\2\)/);
    if(start < 0) return dep;
    end = str.indexOf(")", start) + 1;
    dep.push(RegExp.$3);
    var otherDep = getDepends(str.substr(end));
    return Array.from(new Set(dep.concat(otherDep)));
}



/**
 * 通过sign编译url
 */
function compileUrl(sign){
    if(sign.startsWith("{loader}")){
        sign = sign.replace("{loader}", "");
    }
    if(getFileType(sign) == ""){
        return sign + ".js";
    }
    return sign;
}



/**
 * 获得文件后缀
 */
function getFileType(url){
    const fileName = url.split("/").reverse()[0];
    const index = fileName.indexOf(".");
    return index >= 0
        ? fileName.substr(index)
        : "";
}



/**
 * 构造模块
 */
function createModule(raw, store){
    let exec;
    if(typeof raw === "string"){
        exec = new Function("require, exports", raw);
    }else{
        exec = raw;
    }
    function getModule(sign){
        if(sign.startsWith("{loader}")) return;
        const mod = store.get(sign);
        return mod
            ? mod.instance()
            : null;
    }
    return {
        instance: function(){
            const exports = Object.create(null);
            if(typeof exec === "function"){
                exec(getModule, exports);
            }else{
                return exec;
            }
            return exports;
        }
    };
}