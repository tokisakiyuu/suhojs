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
    //收集require语句
    let requireStatement = raw.match(/(var|let|const)\s+(.*)\s*=\s*require\(.*('|")(.*)\3.*\);?/g);
    //处理export:语句
    raw = raw.replace("export:", "return");
    //如果没有依赖
    if(!requireStatement){
        return this.$executor = new Function("", raw);
    }

    //如果有一个以上的依赖存在
    while(requireStatement[0]){
        let index = 1, step = 2;
        let line = requireStatement.shift();
        let $ = line.split("\"");
        while($[index]){
            this.depend.push($[index]);
            index += step;
        }
    }
    this.$executor = new Function("require", raw);
}