(function(global, factory){
    factory();
}(this, (function(){
    'use strict';

    /**
     * 参数校验
     */

    //是否是dom对象
    let isDOM = function(el){
        return el instanceof HTMLElement
            ? true
            : false;
    }

    //是否是上下文对象
    let isContext = function(_ctx){
        return (_ctx instanceof Node) && _ctx.querySelector
            ? true
            : false;
    }


    /**
     * 用词优化
     */

    //控制台输出
    let warn$ = function(message){
        console.log(message);
    }

    //html文本转单个dom对象
    let toDom = (function(){
        let div = window.document.createElement("div");
        return function(html){
            div.innerHTML = html;
            return div.children[0];
        }
    }());

    //继承一个对象的所有属性
    function extend (to, _from) {
        for (let key in _from) {
            to[key] = _from[key];
        }
        return to
    }

    //珂里函数结果缓存
    function cache(curryFn){
        let lib = Object.create(null);
        return function cacheFn(prop){
            let hit = lib[prop];
            return hit
                ? hit
                : lib[prop] = curryFn(prop);
        }
    }



    /**
     * 根据src获取网络组件
     * ajax同步方式
     */
    let xhr = new XMLHttpRequest();
    let getMod = cache(function(/*string*/ src){
        xhr.open("GET", src, false);
        xhr.send();
        return toDom(xhr.responseText);
    });




    /**
     * 初始化
     */
    let globla;
    let init = function(){
        globla = compile(window.document);
        // console.log(globla);
    }
    window.addEventListener("DOMContentLoaded", init);


   /**
    * 传入上下文对象，完成上下文中的插槽解析，返回插槽实例数组
    */
    let compile = function(/*HTMLDocument || HTMLElement*/ context){
        let slots = [];
        if(!isContext(context)) return slots;
        let raws = context.querySelectorAll("[su-import]");
        for(let i=0; i < raws.length; i++){
            slots.push(new Slot(raws[i]));
        }
        return slots;
    }


    /**
     * 执行js
     */
    let execJs = function(/*Slot*/ slot){
        let self = slot.mod;
        let module = slot.module;
        let jsel = self.querySelector("script");
        if(!jsel) return;

        for(let i=0; i<slot.innerSlot.length; i++){
            let curr = slot.innerSlot[i];
            extend(module, curr.module.exports);
        }

        let fn = new Function("/*" + slot.name + "*/ self, module", jsel.innerText);
        fn(self, module);
    }


    /**
     * 插槽(slot)原型
     * 保存单个插槽的所有信息，创建实例时会尝试获取src路径下的网络组件
     * vm内部使用
     */
    const Slot = function(/*HTMLElement*/ el){
        this.src = el.getAttribute("su-import");
        this.name = this.src.split("/").pop();
        this.mod = getMod(this.src);
        this.host = el.attachShadow({mode: "open"});
        this.host.appendChild(this.mod);
        this.innerSlot = compile(this.mod);
        this.module = {
            exports: Object.create(null)
        }
        execJs(this);
    }



})));