//存放初步解析的模块对象
let modules = new Map();


/**
 * loader
 */
function loader(needModuleUrls, onload){
    let loaded = 0;
    needModuleUrls.forEach((url) => {
        fetchMod(url, (modRaw) => {
            console.log("加载: "+url);
            let mod = new Module(modRaw);
            modules.set(url, mod);
            loader(mod.needs, function(){
                loaded += 1;
                if(needModuleUrls.length == loaded){
                    onload();
                }
            });
        });
    });
    if(needModuleUrls.length == 0){
        onload();
    }
}




/**
 * Module Constructor
 **/
let Module = function(modRaw){
    this.$name = "";
    this.$version = "";
    this.needs = [];
    this.args = [];
    this.$executor = this.compile(modRaw);
}


Module.prototype.compile = function(modRaw){
    //处理import语句
    let importStatement = modRaw.match(/\r?(.*)import (.*) from "(.*)";?/g);
    //处理export语句
    modRaw = modRaw.replace("export", "return");
    //如果没有依赖
    if(!importStatement) return this.fnInstance("", modRaw);

    //如果有一个以上的依赖
    let args = "";
    while(importStatement[0]){
        let one = importStatement.shift();
        modRaw = modRaw.replace(one, "");
        //解构单个语句
        let detail = one.match(/\r?(.*)import (.*) from "(.*)";?/);
        //如果被注释了就忽略此语句
        if(detail[1].indexOf("//") >= 0) continue;
        if(args.length) args += ", ";
        args += detail[2];
        this.args[this.args.length] = detail[2];
        this.needs[this.needs.length] = detail[3];
    }
    return this.fnInstance(args, modRaw);
}


Module.prototype.fnInstance = function(args, body){
    try{
        return new Function(args, body);
    }catch (e) {
        console.error(e);
    }
}




//同步引用过程
let SyncImport = function(mod){
    if(!mod.needs) return mod.$executor();
    let needs = mod.needs;
    for(let i=0; i<needs.length; i++){
        let needOne = needs[i];

    }
    return mod.$executor
}

//正式执行组件
let run = function(){
    let mainMod = modules.get("$main");
    console.log(mainMod)
    // SyncImport(mainMod);
}



window.addEventListener("DOMContentLoaded", function(){
    let mainModRaw = document.querySelector("script[type='text/suho']").innerText;
    let mainMod = new Module(mainModRaw);
    modules.set("$main", mainMod);
    loader(mainMod.needs, run);
});
