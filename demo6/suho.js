
let REQUIRE_RULE = /require\("(.*)"\)/g;
let REQUIRE_REPLACE = /("\))|(require\(")/g;

let compile = function(modRaw, callbackExports){
    let summary = getSummary(modRaw);
    let imports = requireList(summary.jsRaw);
    let exports = Object.create(null);

    imports.forEach(function(url){
        fetchMod(url, function(importModRaw, allLoaded){
            //解析依赖模块
            compile(importModRaw, function(herExport){
                //放进exports待返回
                exports[url] = herExport;
                //如果全部依赖都解析完了
                if(allLoaded){
                    //构建当前模块的完整脚本
                    let mod = new Function("require", summary.jsRaw);
                    let currModExport = mod(function(key){
                        return exports[key];
                    });
                    callbackExports(currModExport);
                }
            });
        })
    });

    if(!imports.length){
        let mod = new Function("", summary.jsRaw);
        callbackExports(mod());
    }
}


//获得引入组件的url列表
let requireList = function(jsRaw){
    let list = jsRaw.match(REQUIRE_RULE);
    if(!list) return [];
    for(let i = 0; i < list.length; i++){
        let curr = list[i];
        list[i] = curr.replace(REQUIRE_REPLACE, "");
    }
    return list;
}


//获取组件摘要
let getSummary = (function(){
    let div = document.createElement("div");
    return function(modRaw){
        div.innerHTML = modRaw;
        let script = div.querySelector("script");
        let frag = document.createDocumentFragment(), child;
        while(child = div.firstChild){
            frag.appendChild(child);
        }
        return {
            jsRaw: script? script.innerText: "",
            dom: frag
        }
    }
}());



function Suho(mainFunc){
    let mainFuncRaw = mainFunc.toString();
    let startIndex = mainFuncRaw.indexOf("{") + 1;
    let endIndex = mainFuncRaw.lastIndexOf("}");
    let mainModRaw = mainFuncRaw.substring(startIndex, endIndex);
    mainModRaw = "<script>"+ mainModRaw +"</script>"
    compile(mainModRaw, function(exports){});
}



let fetchMod = (function(){
    let xhr = new XMLHttpRequest(),
        queue = [],
        allTaskComplete = true,
        fetchMod = function(url, callback){
            xhr.open("GET", url, true);
            xhr.send();
            xhr.onload = function(){
                if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    let task = queue.shift();
                    if(!task) {
                        allTaskComplete = true;
                        callback(xhr.responseText, allTaskComplete);
                        return;
                    }
                    callback(xhr.responseText);
                    fetchMod(task.url, task.cbk);
                }
            }
        };

    return function(url, cbk){
        if(allTaskComplete) {
            allTaskComplete = false;
            return fetchMod(url, cbk);
        }
        queue.push({
            url: url,
            cbk: cbk
        });
    }
}());