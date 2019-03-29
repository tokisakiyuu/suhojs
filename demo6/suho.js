let compile = function(modRaw, callbackExports){
    let summary = getSummary(modRaw);
    let currModImports = {}, currModExport = {}, currModFunction;

    if(!summary.needModules.length){
        currModFunction = new Function("$doc", summary.jsRaw);
        currModExport = currModFunction(summary.doc);
        //导出当前模块的$doc
        currModExport && (currModExport.$doc = summary.doc);
        return callbackExports(currModExport);
    }
    summary.needModules.forEach(function(url){
        fetchMod(url, function(herModRaw, allLoaded){
            //解析依赖模块
            compile(herModRaw, function(herModExport){
                //放进当前模块的依赖列表待返回
                currModImports[url] = herModExport;
                //如果全部依赖都解析完了
                if(allLoaded){
                    console.log("allLoaded true")
                    //构建当前模块的完整脚本
                    currModFunction = new Function("require, $doc", summary.jsRaw);
                    currModExport = currModFunction(function(key){
                        return currModImports[key];
                    }, summary.doc);
                    //导出当前模块的$doc
                    currModExport && (currModExport.$doc = summary.doc);
                    callbackExports && callbackExports(currModExport);
                }
            });
        })
    });
}


//扫描组件doc，定位插槽，放置组件
let putFrag = function(){

}



let Suho = function(){

}

Suho.main = function(mainFunc){
    let mainFuncRaw = mainFunc.toString();
    let startIndex = mainFuncRaw.indexOf("{") + 1;
    let endIndex = mainFuncRaw.lastIndexOf("}");
    let mainModRaw = mainFuncRaw.substring(startIndex, endIndex);
    mainModRaw = "<script>"+ mainModRaw +"</script>";
    compile(mainModRaw);
}