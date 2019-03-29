let modules = new Map();
let wait = [];


let addModule = function(mod){
    modules.set(mod.url, mod);
}

let getModule = function(url){
    let mod = modules.get(url);
    return typeof mod.$executor == "function"? mod.$executor(getModule):void(0);
}



let mainModUrl = document.currentScript.getAttribute("suho-main");
let mainMod = new Component(mainModUrl);
mainMod.onload = function(){
    addModule(mainMod);
    let waitTask = [].slice.call(mainMod.depend);
    for(let i=0;i<waitTask.length;i++){
        wait.push(waitTask[i]);
    }
    snail_crawl(runProcess);
}


/**
 * 蜗牛爬行
 * 蜗牛在爬行时，它的腹足足腺上不断分泌出一种黏液(element of wait)，这种黏液有助于蜗牛爬行，能提高它的爬行速度。因此，蜗牛爬过的地方，会留下一条黏液的痕迹(waitTask loaded)。这种黏液干了以后，看上去是银白色的，而且很光亮(elements of modules)。
 */
let snail_crawl = function(onAllLoad){
    if(!wait.length) return onAllLoad();
    let url = wait.shift();
    let mod = new Component(url);
    mod.onload = function(){
        addModule(mod);
        let waitTask = [].slice.call(mod.depend);
        for(let i=0;i<waitTask.length;i++){
            wait.push(waitTask[i]);
        }
        snail_crawl(onAllLoad);
    }
}


let runProcess = function(){
    if(document.readyState == "complete"){
        getModule(mainModUrl);
    }else{
        document.addEventListener("readystatechange", function(){
            if(document.readyState == "complete")
                getModule(mainModUrl);
        })
    }
}