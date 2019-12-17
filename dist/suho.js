/**
* suhojs
* 2019/12/3 
* @author tokisakiyuu
* @version 2.0
* @description 重构，promisify，优化module对象
* @license MIT
*/

;(function(){
    // 等待fetch的模块
    let waitLoad = [];

    // 保存loader模块的id
    let loaders = {
        ".js": "js-loader"
    };

    // 获得此模块的子模块
    function getChildren(raw){
        let index = 0, startSign = "require(", endSign = ")";
        let matchs = [];
        while(true){
            let posA = raw.indexOf(startSign, index);
            if(posA < 0) break;
            index = posA;
            let posB = raw.indexOf(endSign, index);
            if(posB < 0) break;
            index = posB;
            let quoteContent = raw.substring(posA + startSign.length, posB);
            quoteContent = quoteContent.trim();
            if(quoteContent.length < 3) continue;
            let match = quoteContent.substring(1, quoteContent.length - 1);
            matchs.push(match);
        }
        return toSetArray(matchs);
    }


    // 子模块放进待加载队列
    function addChildModuleLoadTask(waitLoad, parentModulePath, children){
        children.forEach(child => {
            if(isLoader(child)) {
                let loaderSignEndIndex = child.indexOf("}");
                // let loaderSign = child.substring(0, loaderSignEndIndex + 1)
                let childUrl = child.substring(loaderSignEndIndex + 1);
                childUrl = addSuffix(childUrl);
                return waitLoad.push({
                    id: child,
                    path: urlPathEval(parentModulePath, childUrl)
                });
            }
            return waitLoad.push({
                id: child,
                path: urlPathEval(parentModulePath, addSuffix(child))
            });
        });
    }


    // url路径计算
    function urlPathEval(fromUrl, toUrl){
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


    // 获取响应
    let fetchResponse = ((/* url */) => {
        let record = {};
        return function(url){
            if(record[url]) return Promise.resolve(record[url].clone());
            return fetch(url)
                .then(response => {
                    record[url] = response.clone();
                    return response;
                })
        }
    })();


    // 构建模块
    function buildModule(moduleid, path, moduleType, raw, children){
        let m = new function Module(){
            this.id = moduleid;
            this.path = path;
            this.moduleType = moduleType;
            this.loaded = false;
            this.exports = {};
        }
        if(moduleType === "module"){
            m.children = children;
            m.raw = raw;
            store[moduleid] = m;
        }else if(moduleType === "base module"){
            m.loader = true;
            m.exports = raw;
            store[moduleid] = m;
        }else if(moduleType === "loader"){
            m.children = children;
            m.raw = raw;
            store[moduleid] = m;
        }else{
            throw new Error("unknow type module");
        }
    }


    // 模块仓库，供require引用
    let store = {
        "js-loader": {
            id: "js-loader",
            path: "[built-in]",
            type: "loader",
            loaded: true,
            children: [],
            exports: function(source){
                return source.text();
            }
        }
    };

    // require
    function require(moduleid){
        // if(isLoader(moduleid)){
        //     moduleid = getLoaderInfo(moduleid).path;
        // }
        let module = store[moduleid];
        if(!module) throw new Error("not found module '"+ moduleid +"'");
        if(module.loaded) return module.exports;
        if(module.type === "base module") return module.exports;
        let runner = new Function("require, module, exports", module.raw);
        runner(require, module, module.exports);
        module.loaded = true;
        return module.exports;
    }

    require.toString = function(){
        return "function require(moduleid){ [suhojs code] }";
    }



    function getLoaderSupply(sign){
        // {loader!html}html-loader
        let ar = sign.split("}")
        return ar[0].split("!")[1]
    }


    function isLoader(sign){
        return sign.startsWith("{loader!");
    }



    // 
    let mainModId = document.currentScript.getAttribute("data-main") || "index.js";
    waitLoad.push({
        id: mainModId,
        path: urlPathEval(location.href, addSuffix(mainModId))
    });

    function start(){
        let task = waitLoad.shift();
        if(!task) return Promise.resolve(); // 没有任务了说明所有模块已经全部加载完毕了
        let moduleid = task.id;
        let path = task.path;
        let supplySuffix;
        if(isLoader(moduleid)) {
            supplySuffix = getLoaderSupply(moduleid);
        }
        
        return fetchResponse(path)
            .then(response => {
                // 找到对应loader，并转换response为raw
                let suffix = getSuffix(path);
                let loaderid = loaders[suffix] || "js-loader";
                let loader = require(loaderid);
                return loader(response);
            })
            .then(raw => {
                // 判读raw是否是字符串，是字符串就找出require语句，提取子模块
                if(typeof raw === "string"){
                    let children = getChildren(raw);
                    // 子模块放进待加载队列
                    addChildModuleLoadTask(waitLoad, path, children);
                    // [].push.apply(waitLoad, children);                    
                    if(supplySuffix) {
                        // 如果此模块是一个loader，就构建一个loader
                        buildModule(moduleid, path, "loader", raw, children);
                        loaders["." + supplySuffix] = moduleid;
                    }else{
                        buildModule(moduleid, path, "module", raw, children);
                    }
                }else{
                    // 不是字符串
                    buildModule(moduleid, path, "base module", raw);
                }
            })
            // 进行下一个任务
            .then(() => {
                return start();
            })
    }

    // 
    start()
        .then(() => {
            require(mainModId)
        })



    console.log(
        "%c SuhoJs %c v2.0.2 \n%s",
        "background-color: #03a9f4;color: white;",
        "background-color: #000;color: white;",
        "https://github.com/TokisakiYuu/suhojs"
    );
}());