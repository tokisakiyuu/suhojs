let BaseModule = function(url){
    this.url = url;
    this.onload = null;
    this.depend = [];
    this.suffix = url.substring(url.lastIndexOf("."));
    this.init();
}

BaseModule.prototype.init = function(){
    let me = this;
    this.fetch(function(modRaw){
        me.raw = modRaw;
        me.compile(modRaw);
        if(typeof me.onload == "function"){
            me.onload(me);
        }
    });
}


BaseModule.prototype.fetch = function(retRaw){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", this.url, true);
    xhr.send();
    xhr.onload = function(){
        if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
            retRaw(xhr.responseText);
        }
    }
}


//编译suhojs的模块语法 1.0
// BaseModule.prototype.compile = function(raw){
//     //收集require语句
//     let requireStatement = raw.match(/(var|let|const)\s+(.*)\s*=\s*require\(.*('|")(.*)\3.*\);?/g);
//     //处理export:语句
//     raw = raw.replace("export:", "return");
//     //如果没有依赖
//     if(!requireStatement){
//         return this.$executor = new Function("", raw);
//     }

//     //如果有一个以上的依赖存在
//     while(requireStatement[0]){
//         let index = 1, step = 2;
//         let line = requireStatement.shift();
//         let $ = line.split("\"");
//         while($[index]){
//             this.depend.push($[index]);
//             index += step;
//         }
//     }
//     this.$executor = new Function("require", raw);
// }

//编译suhojs的模块语法 2.0
BaseModule.prototype.compile = function(raw){
    let me = this;
    //处理export:语句。
    raw = raw.replace("export:", "return");
    //存放require的参数，
    let requireUrlArgs = [];
    let requireOtherArgs = [];
    //收集require参数的handle，
    let collectFn;
    //借此机会可以做一个语法错误预检。
    try{
        collectFn = new Function("require", raw);
    }catch(e){
        return console.error("[Suho error] Found an error in \""+this.url+"\" at Pre-check.\n"+e);
    }
    //运行这个收集过程，忽略报错，运行完之后将收集到这个模块内所有require的参数
    try{
        collectFn(function(arg){
            if(typeof arg == "string"){                 //string类型的是url
                me.depend.push(arg);
                requireUrlArgs.push(arg);
            }
            if(typeof arg == "object"){                 //object类型的参数保留
                requireOtherArgs.push(requireOtherArgs);
            }
        });
    }catch(e){}
    this.$executor = new Function("require", raw);
}