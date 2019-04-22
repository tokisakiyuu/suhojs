/*!
 * Suho.js v1.0.3
 * 2019 TokisakiYuu
 */



(function(){
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



/**!
 * 2019 Yuu
 */



/**
 * 加载任务队列
 * 用于临时存放需要加载的资源的url，当资源被加载后可能依赖了其它资源，又会生成新的任务，
 * 所以这个队列是动态增长的，直到所有的依赖资源被加载完，不再有新任务被送往队列中
 */
let waiting = [];





/**
 * 递归加载任务队列中的每个资源，并在发现依赖时向队列添加新任务
 */
let snail_crawl = function (onOver) {
    //队列完成时执行完成回调
    if (!waiting.length) {
        return onOver();
    }
    //得到队列中第一个任务
    let url = waiting.shift();
    //如果已经存在
    if(isExits(url)) {
        return nextTask(onOver);
    }
    //生成模块
    generateModule( url, 
        function(module) {
            modules.set(url, module);
            //继续下个任务
            nextTask(onOver);
        }
    );
}



/**
 * 继续队列中的下一个任务
 */
let nextTask = snail_crawl;




/**
 * 如果对应模块已经存在
 */
function isExits(url){
    return modules.has(url);
}





/*!
 * 2019 Yuu
 */



/**
 * 生成模块
 */
let generateModule = function(url, retModule){
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
 * !如果是未知类型的文件那就生成一个直接返回文件内容的模块
 */
function compile(url, raw, retModule){
    if(notJsFile(url)){
        retModule(
            new Function("                         /* "+ url +" */", "return `"+ raw +"`")
        );
        return;
    }

    raw = exportStatment(raw);
    let depends = getDepend(raw);
    depends.forEach(
        function pushWaitingOnlyUrl(url){
            //推入任务队列
            waiting.push(url);
        }
    );
    
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
            function findDepend(url){
                depends.push(url);
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
        }
    }
}



/**
 * 检查url指向的文件是否是一个非js脚本的文件
 */
function notJsFile(url){
    return url.substr(url.lastIndexOf(".")) != ".js";
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
 * 从当前script节点上获取入口脚本的url
 */
let mainModUrl = document.currentScript.getAttribute("suho-main");
let configUrl  = document.currentScript.getAttribute("suho-config");



/**
 * 运行配置脚本
 */
loadAndRunConfig(configUrl);



/**
 * 当入口模块被生成后，此变量应该被替换成入口模块，否则默认函数被运行了说明内部出错了
 */
let mainMod = function(){
    error(
        "The main module failed to load"
    );
}

/**
 * 生成入口模块
 */
function doWork(){
    generateModule(
        mainModUrl, 
        function(module) {
            mainMod = module;
            snail_crawl(produce);
        }
    );
}



/**
 * 当所有所需的模块都被正确地加载到了环境中后，调用此函数开启正常业务流程，进入生产环节，
 * 并且确保此函数被调用时页面已经加载完毕了
 */
function produce() {
    //确保运行时页面已经加载完毕了
    if (document.readyState == "complete") {
        mainMod(require);
    } else {
        document.addEventListener("readystatechange", function () {
            if (document.readyState == "complete"){
                mainMod(require);
            }
        })
    }
}



/**
 * 配置参数
 */
const Suho = {
    a: 2,
    b: 3
}



/**
 * 加载并运行配置脚本
 * @todo 完善配置脚本特性
 */
function loadAndRunConfig(url){
    if(!url) return doWork();
    fetchResource(url, "text", function(raw){
        var configFn = new Function("Suho                        /* config */", raw);
        configFn(Suho);
        doWork();
    });
}




/**
 * 从模块库中取用一个模块
 */
function require(url){
    let module = modules.get(url);
    return module
        ? module(require)
        : null;
}
}());