/**
* suhojs
* 2019/12/18 
* @author tokisakiyuu
* @version 3.0
* @description 加入配置文件，并进一步规范化
* @license MIT
*/


// 各种表
const TAB = {
    modules: {
        suho: buildModule("suho", "[Built-in]", {
            rawType: {
                text: "text",
                arraybuffer: "arraybuffer",
                blob: "blob",
                document: "document",
                json: "json"
            }
        })
    },
    modulesPath: {

    },
    loadTasks: [],
    rules: {}
}


// 核心require函数
function require(moduleid){
    let contextModule = require._context;
    let module = TAB.modules[moduleid];
    if(!module) throw new Error("not found module '"+ moduleid +"'");
    if(module.loaded) return module.exports;
    let runner = new Function("require, module, exports", module._raw);
    require._context = module.path;
    runner(require, module, module.exports);
    module.loaded = true;
    module.parent = contextModule || null;
    delete module._raw;
    return module.exports;
}
require.toString = function(){
    return "function require(moduleid){ [suhojs code] }";
}
require._context = null;


// 获取响应
let fetchResponse = ((/* url */) => {
    let record = {};
    return function(url){
        let hit = record[url];
        if(hit) return hit.then(response => response.clone());
        record[url] = fetch(url);
        return record[url].then(response => response.clone());
    }
})();


// 获取一串字符串中所有require函数中第一个参数，返回数组
function getAllRequireContent(str){
    let index = 0, startSign = "require(", endSign = ")";
    let matchs = [];
    while(true){
        let posA = str.indexOf(startSign, index);
        if(posA < 0) break;
        index = posA;
        let posB = str.indexOf(endSign, index);
        if(posB < 0) break;
        index = posB;
        let quoteContent = str.substring(posA + startSign.length, posB);
        quoteContent = quoteContent.trim();
        if(quoteContent.length < 3) continue;
        let match = quoteContent.substring(1, quoteContent.length - 1);
        matchs.push(match);
    }
    return toSetArray(matchs);
}


// 数组去重
function toSetArray(array){
    let result = []
    let obj = {}
    for (let i of array) {
        if (!obj[i]) {
            result.push(i)
            obj[i] = 1
        }
    }
    return result
}




// 构建模块
/**
 * 模块的基本结构:
 * id           模块的id
 * exports      模块的导出
 * parent       第一次require此模块的模块
 * path         模块的加载路径
 * loaded       模块是否已经被加载过了(第一次被require之后变为true)
 * children     模块的子模块
 * _raw         模块未加载时的原始资源，被加载之后删除这个字段
 */
function buildModule(id, path, source){
    let isStringSource = typeof source === "string";
    return {
        id: id,
        exports: !isStringSource ? source : null,
        parent: null,
        loaded: !isStringSource,
        path: path,
        children: isStringSource ? getAllRequireContent(source) : [],
        _raw: source,
        __proto__: {constructor: function Module(){}}
    }
}




// 模块id解析器，分析模块id从而得到模块路径(远程模块和本地模块)
function parseModuleId(moduleid) {
    if(moduleid.startsWith("@")) {
        return {type: "remote", path: `${TAB.modulesRoot}/${moduleid.substring(1)}/index.js`}
    }
    if(!moduleid.startsWith(".") && !moduleid.startsWith("/") && TAB.modules[moduleid]) {
        return {type: "local", path: null}
    }
    return {type: "remote", path: addSuffix(moduleid)};
}


// url路径计算
function urlPathEval(fromUrl, toUrl){
    if(!toUrl) {
        toUrl = fromUrl;
        fromUrl = location.href;
    }
    let fullFromUrl = new URL(fromUrl, location.origin);
    return new URL(toUrl, fullFromUrl).href;
}


// 为url添加默认后缀
function addSuffix(url){
    let filename = url.split("/").pop();
    let index = filename.lastIndexOf(".");
    if(index < 0) return url + ".js";
    if(index == filename.length - 1) return url + "js";
    return url;
}

// 获取后缀
function getSuffix(url){
    let filename = url.split("/").pop();
    if(filename.lastIndexOf(".") >= 0){
        return filename.substring(filename.lastIndexOf("."));
    }else{
        return "";
    }
}


// 递归调用loader处理source
function handleSourceUseLoader(source, loaderList){
    let loaderid = loaderList.shift();
    if(!loaderid) return Promise.resolve(source);
    let loader = require(loaderid);
    let newSource = loader(source);
    if(newSource instanceof Promise){
        return newSource
            .then(source => {
                return handleSourceUseLoader(source, loaderList);
            })
    }else{
        return Promise.resolve(newSource)
            .then(source => {
                return handleSourceUseLoader(source, loaderList);
            })
    }
}



// 消耗loadTask中的任务
function todoLoadTask(){
    let tasks = [];
    TAB.loadTasks.forEach(moduleid => {
        let moduleInfo = parseModuleId(moduleid);
        if(moduleInfo.type === "loacl") return;
        let fullPath = urlPathEval(moduleInfo.path);
        // 如果发现 modulesPath中有对应路径的记录，说明是同一个模块，只是require时用了不同的id，那么只需要建立一个额外的引用即可，不要再建立新的模块
        if(TAB.modulesPath[fullPath]) return TAB.modules[moduleid] = TAB.modulesPath[fullPath];
        let suffix = getSuffix(fullPath);
        let rule = TAB.rules[suffix];
        tasks.push(
            fetchResponse(fullPath)
                .then(response => {
                    // 根据rawType配置返回对应类型的数据
                    if(rule && rule.rawType && response[rule.rawType]) {
                        return response[rule.rawType]();
                    }
                    return response.text();
                })
                .then(source => {
                    if(!rule || !rule.useLoader) return source;
                    return handleSourceUseLoader(source, [].slice.call(rule.useLoader));
                })
                .then(source => {
                    return {
                        id: moduleid,
                        path: fullPath,
                        source: source
                    }
                })
        )
    });
    return Promise.all(tasks)
        .then(rawInfoList => {
            // 清空任务队列
            TAB.loadTasks.length = 0;
            // 生成模块
            rawInfoList.forEach(rawInfo => {
                // 如果发现 modulesPath中有对应路径的记录，说明是同一个模块，只是require时用了不同的id，那么只需要建立一个额外的引用即可，不要再建立新的模块
                if(TAB.modulesPath[rawInfo.path]) return TAB.modules[rawInfo.id] = TAB.modulesPath[rawInfo.path];
                let module = buildModule(rawInfo.id, rawInfo.path, rawInfo.source);
                // 存储模块，此时模块已经准备就绪，随时可以require
                TAB.modules[rawInfo.id] = module;
                // 再创建一条请求路径的记录
                TAB.modulesPath[rawInfo.path] = module;
                // 创建子模块加载任务
                [].push.apply(TAB.loadTasks, module.children);
            })
        })
        .then(() => {
            // 没有任务了就退出递归
            if(TAB.loadTasks.length == 0) return;
            // 还有任务就继续清空队列，整体来看是一个异步递归
            return todoLoadTask();
        })
}








// 得到配置文件路径
let suhoConfigModulePath = document.currentScript.getAttribute("data-config") || "./suho.config.js";
let suhoConfigModuleFullPath = urlPathEval(suhoConfigModulePath);
fetchResponse(suhoConfigModuleFullPath)
    .then(response => {
        return response.text()
    })
    .then(suhoConfigRaw => {
        let configModule = buildModule("config", suhoConfigModuleFullPath, suhoConfigRaw);
        TAB.modules["config"] = configModule;
        let exports = require("config");
        return exports
    })
    .then(config => {
        // 读入第三方模块根目录
        TAB.modulesRoot = config.modules || "./node_modules";
        // 读入入口文件路径
        let entry = config.entry || "./index.js";
        TAB.entry = entry;
        TAB.loadTasks.push(entry);
        // 读入文件解析规则
        if(config.rules){
            config.rules.forEach(rule => {
                let way = {rawType: rule.rawType, useLoader: rule.useLoader}
                rule.suffix.forEach(suffix => {
                    TAB.rules[suffix] = way;
                })
            })
        }
        // console.log(TAB.rules);
        return config
    })
    .then(config => {
        // 发起请求获取loader源码
        if(!config.loaders) return config;
        let tasks = [];
        config.loaders.forEach(loader => {
            let loaderInfo = parseModuleId(loader.path);
            let loaderFullPath = urlPathEval(loaderInfo.path);
            tasks.push(
                fetchResponse(loaderFullPath)
                    .then(res => res.text())
                    .then(raw => {
                        return {id: loader.id, path: loaderFullPath, _raw: raw};
                    })
            );
        })
        return Promise.all(tasks);
    })
    .then(loaders => {
        loaders.forEach(loader => {
            TAB.modules[loader.id] = buildModule(loader.id, loader.path, loader._raw);
        })
        // console.log(TAB.modules);
    })
    .then(() => {
        return todoLoadTask();
    })
    .then(() => {
        // console.log(TAB.modules);
        // console.log(TAB.modulesPath)
        require(TAB.entry);
    })









console.log(
    "%c SuhoJs %c v3.0.0 \n%s",
    "background-color: #03a9f4;color: white;",
    "background-color: #000;color: white;",
    "https://github.com/TokisakiYuu/suhojs/tree/suho3.0"
);