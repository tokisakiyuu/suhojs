//存放已经加载的模块
let modules = new Map();
//存放loader
let loaders = new Map();
//存放等待被加载的模块的地址
let wait = [];


//已加载完成的模块移动到modules
let addModule = function(mod){
    modules.set(mod.url, mod);
}


//同步加载器，用于注入
let getModule = function(url){
    let mod = modules.get(url);
    return typeof mod.$executor == "function"? mod.$executor(getModule):void(0);
}


//定义加载器，suffix可以是一个包含种文件后缀的数组，用于注入
let defineLoader = function(suffix, loader){
    if(suffix instanceof Array){
        while(suffix[0]){
            let sym = suffix.shift();
            loaders.set(sym, loader);
        }
        return;
    }else if(suffix instanceof String){
        loader.set(suffix, loader);
    }
}


//获取主模块、获取主模块
let mainModUrl = document.currentScript.getAttribute("suho-main");
let mainMod = new BaseModule(mainModUrl);
mainMod.onload = function(){
    addModule(mainMod);
    let waitTask = [].slice.call(mainMod.depend);
    for(let i=0;i<waitTask.length;i++){
        wait.push(waitTask[i]);
    }
    snail_crawl(runProcess);
}


//爬行蜗牛
let snail_crawl = function(onAllLoad){
    if(!wait.length) return onAllLoad();
    let url = wait.shift();
    let mod = new BaseModule(url);
    mod.onload = function(){
        addModule(mod);
        let waitTask = [].slice.call(mod.depend);
        for(let i=0;i<waitTask.length;i++){
            wait.push(waitTask[i]);
        }
        snail_crawl(onAllLoad);
    }
}


//所有模块准备完毕，开始运行
let runProcess = function(){
    //确保运行时页面已经加载完毕了
    if(document.readyState == "complete"){
        getModule(mainModUrl);
    }else{
        document.addEventListener("readystatechange", function(){
            if(document.readyState == "complete")
                getModule(mainModUrl);
        })
    }
}