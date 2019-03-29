let Component = function(url){
    this.url = url;
    this.onload = null;
    this.depend = [];
    this.suffix = url.substring(url.lastIndexOf("."));
    this.init();
}

Component.prototype.init = function(){
    let me = this;
    this.fetch(function(componentRaw){
        me.raw = componentRaw;
        me.compile(componentRaw);
        if(typeof me.onload == "function"){
            me.onload(me);
        }
    });
}


Component.prototype.fetch = function(retRaw){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", this.url, true);
    xhr.send();
    xhr.onload = function(){
        if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
            retRaw(xhr.responseText);
        }
    }
}

Component.prototype.compile = function(raw){
    //处理import语句
    let importStatement = raw.match(/\r?(.*)import (.*) from "(.*)";?/g);
    //处理export语句
    raw = raw.replace("export default", "return");
    //如果没有依赖
    if(!importStatement) {
        this.$executor = new Function("", raw);
        return;
    }

    //如果有一个以上的依赖
    while(importStatement[0]){
        let one = importStatement.shift();

        //解构单个语句
        let detail = one.match(/\r?(.*)import (.*) from "(.*)";?/);
        //如果被注释了就忽略此语句
        if(detail[1].indexOf("//") >= 0) continue;

        this.depend.push(detail[3]);

        raw = raw.replace(one, "let "+detail[2]+" = require('"+detail[3]+"')");
    }

    this.$executor = new Function("require", raw);
}