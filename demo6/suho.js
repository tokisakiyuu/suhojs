
let REQUIRE_RULE = /require\("(.*)"\)/g;
let REQUIRE_REPLACE = /("\))|(require\(")/g;

let compile = function(modRaw, callbackExports){
    let summary = getSummary(modRaw);
    let imports = requireList(summary.jsRaw);
    let exports = Object.create(null);

    imports.forEach(function(url){
        fetchMod(url, function(herModRaw, allLoaded){
            //解析依赖模块
            compile(herModRaw, function(herModExport){
                //放进exports待返回
                exports[url] = herModExport;
                //如果全部依赖都解析完了
                if(allLoaded){
                    //构建当前模块的完整脚本
                    let mod = new Function("require, $doc", summary.jsRaw);
                    let currModExport = mod(function(key){
                        return exports[key];
                    }, summary.doc);
                    //导出当前模块的$doc
                    currModExport && (currModExport.$doc = summary.doc);
                    callbackExports(currModExport);
                }
            });
        })
    });

    if(!imports.length){
        let mod = new Function("", summary.jsRaw);
        let currModExport = mod(summary.doc);
        //导出当前模块的$doc
        currModExport && (currModExport.$doc = summary.doc);
        callbackExports(currModExport);
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
        let script, doc, style;
        let frag = document.createDocumentFragment(), child;
        while(child = div.firstElementChild){
            let nodeName = child.nodeName.toLocaleLowerCase();
            switch (nodeName) {
                case "script":
                    script = child;
                    div.removeChild(script);
                    break;
                case "style":
                    style = child;
                    frag.appendChild(child);
                    break;
                default:
                    frag.appendChild(child);
                    doc = child;
            }
        }
        return {
            jsRaw: script? script.innerText: "",
            frag: frag,
            doc: doc,
            style: style
        }
    }
}());


//扫描组件doc，定位插槽，放置组件
let putFrag = function(){

}



function Suho(mainFunc){
    let mainFuncRaw = mainFunc.toString();
    let startIndex = mainFuncRaw.indexOf("{") + 1;
    let endIndex = mainFuncRaw.lastIndexOf("}");
    let mainModRaw = mainFuncRaw.substring(startIndex, endIndex);
    mainModRaw = "<script>"+ mainModRaw +"</script>";
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