

/**
 * 解析
 */
const Compiler = function(el){
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if(this.isElementNode(this.$el))
    if (this.$el) {
        this.$fragment = this.nodeToFragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}


/**
 * 是否是element
 */
Compiler.prototype.isElementNode = function(el){
    return el instanceof Element;
}

/**
 * 把要解析的节点全部放入documentFragment以提高页面渲染性能
 */
Compiler.prototype.nodeToFragment = function(el){
    let fragment = document.createDocumentFragment(), child;
    while (child = el.firstChild){
        fragment.appendChild(child);
    }
    return fragment;
}

/**
 * 执行初始化
 */
Compiler.prototype.init = function(){
    this.compile(this.$fragment);
}


/**
 * 解析入口
 */
Compiler.prototype.compile = function(el){
    //copy
    let childNodes = [].slice.call(el.childNodes);
    let temp = [];
    for(let i = 0; i < childNodes.length; i++){
        let node = childNodes[i];
        //如果是自定义元素
        if(/^su-([a-z]+)$/.test(node.nodeName.toLocaleLowerCase()) && node.hasAttribute("put")){
            // RegExp.$1
            temp.push(node);
        }
    }
    console.log(temp)
}


/**
 * 解析工具集
 */
Compiler.prototype.compileUtil = {

    //解析自定义元素
    compileCustomElement(el) {
        let url = el.getAttribute("put");
        this.$fetch(url, function(htm){

        });
    },

    //请求获取组件
    $fetch: (() => {
        let mods = Object.create(null);
        return function request(url, _notify){
            let xhr = new XMLHttpRequest();
            if(mods[url]) return mods[url];
            xhr.open("GET", url, true);
            xhr.onload = () => xhr.status >= 200 && xhr.status < 300 || xhr.status == 304 ? _notify(mods[url] = xhr.response) : _notify(undefined);
            xhr.send();
        };
    })(),

    //html字符串转dom
    toDom: (() => {
        let div = document.createElement("div");
        return function toDom(htm){
            let frag = document.createDocumentFragment(), child;
            div.innerHTML = htm;
            while (child = div.firstChild){
                frag.appendChild(child);
            }
            return frag;
        }
    })()
}