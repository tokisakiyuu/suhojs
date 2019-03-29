//同步获取模块
let syncFetchMod = function(url){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    return xhr.response;
}

//仓库
let modules = {};

let imports = function(url){
    let dependCode = syncFetchMod(url);
    let fn = new Function("/*"+url+"*/imports", dependCode.replace("export default", "return"));
    return fn(imports);
}


let mainScriptUrl = document.currentScript.getAttribute("suho-main");
imports(mainScriptUrl);