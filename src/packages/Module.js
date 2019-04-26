/*!
 * 2019 Yuu
 */



/**
 * 生成模块
 */
let generateModule = function(task, retModule){
    let url = task.url;
    fetchResource( url, "text", function(raw){
        compile(url, raw, retModule);
    });
}




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
function compile(url, raw, retModule){
    raw = exportStatment(raw);
    let depends = getDepend(raw);
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
    
    retModule(
        new Function("require" + "                           /* "+ url +" */", raw)
    )
}



/**
 * 收集模块源码中的依赖。忽略收集过程中的错误
 */
function getDepend(raw){
    let depends = [];
    let findDepend = function(url){
        depends.push(url);
    };
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
