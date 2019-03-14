'use strict';

/**
 * 对外接口原型
 * @constructor
 */
const Su = function(mods, exec){
    //循环获取组件
    for(let mod in mods){
        util.fetchMod(mods[mod], function(sour){
            console.log(sour.doc);
        })
    }
            //执行组件中的脚本
            //把导入挂载到this上

            //执行当前回调
            //把组件置入当前页面对应位置
}



const SuhoUtils = function(){
    //初始化
    this.modsMap = Object.create(null);
    //为fetchMod挂上缓存特性
    this.fetchMod = this.cacheMod(this.fetchMod);
}


SuhoUtils.prototype = {
    //获取组件
    fetchMod: (function(){
        let xhr = new XMLHttpRequest(),
            queue = [],
            allTaskComplete = true,
            fetchMod = function(url, callback){
                xhr.open("GET", url, true);
                xhr.send();
                xhr.onload = function(){
                    if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        callback(xhr.responseText);
                        let task = queue.shift();
                        if(!task) {
                            allTaskComplete = true;
                            return;
                        }
                        fetchMod(task.url, task.cbk);
                    }
                }
            };

        return function(url, cbk){
            if(allTaskComplete) {
                allTaskComplete = false;
                return fetchMod(url, cbk);
            }
            queue.push({
                url: url,
                cbk: cbk
            });
        }
    }()),


    //缓存组件
    cacheMod: function(fn){
        let me = this;
        let map = this.modsMap;
        return (url, _notify) => {
            let hit = map[url];
            if(hit){
                _notify(hit);
            }else{
                fn(url, function(mod){
                    map[url] = me.analysis(mod);
                    _notify(map[url]);
                })
            }
        }
    },


    //分析组件并返回分析结果
    analysis: function(raw){
        if(!raw){
            return {
                doc: "",
                jsSource: ""
            }
        }
        let tmp = document.createElement("div");
        tmp.innerHTML = raw;
        let script = tmp.querySelector("script");
        let jsSource = "";
        if(script){
            tmp.removeChild(script);
            jsSource = script.text;
        }
        return {
            doc: tmp.innerHTML,
            jsSource: jsSource
        }
    }
}

const util = new SuhoUtils();