/*!
 * Suho.js v1.0.5
 * 2019 TokisakiYuu
 */


;(function(){
    /**
     * 模块仓库。
     * 它用来存放已经被加载的模块，这里的模块全部都已经准备就绪了。
     * 模块是以键值对的形式存放的，便于在取用时快速响应，形式是 {url -> Module}
     * "url"是指模块的网络地址，Module是指一个内建的模块对象
     */
    let modules = new Map();


    /**
     * 别名表。
     * 为模块创建的别名储存在此，require函数引入模块时优先查找这里的键
     */
    let alias = new Map();


    /**
     * 加载任务队列
     * 用于临时存放需要加载的资源的url，当资源被加载后可能依赖了其它资源，又会生成新的任务，
     * 所以这个队列是动态增长的，直到所有的依赖资源被加载完，不再有新任务被送往队列中
     */
    let waiting = [];


    /**
     * 递归加载任务队列中的每个资源，并在发现依赖时向队列添加新任务
     */
    let snail_crawl = function (onOver) {
        //队列完成时执行完成回调
        if (!waiting.length) {
            return onOver();
        }
        //得到队列中第一个任务
        let task = waiting.shift();
        let sign = task.sign;
        let config = task.config;
        //如果对应模块已经存在
        if(isExits(task.url)) {
            return nextTask(onOver);
        }

        //存储模块到仓库
        function saveModule(module){
            task.$ = module;
            modules.set(sign, task);
            //继续下个任务
            nextTask(onOver);
        }
        //如果存在用户配置或者不是js脚本
        if(config || task.type != ".js"){
            //生成自定模块
            generateCustomModule( task, saveModule);
        }else{
            //生成标准模块
            generateModule( task, saveModule);
        }
    }



    /**
     * 继续队列中的下一个任务
     */
    let nextTask = snail_crawl;




    /**
     * 如果对应模块已经存在
     */
    function isExits(url){
        return modules.has(url);
    }


    /**
     * 编译url
     * 处理别名、缩写等
     * @todo 增加表达式写法
     */
    function compileUrl(sign){
        let url = sign;
        url = replaceAlias(sign);
        url = replaceRoot(url);
        url = replaceAbbr(url);
        return url;
    }



    /**
     * 别名映射查询
     * @param {string} sign 
     */
    function replaceAlias(sign){
        let realUrl = alias.get(sign);
        if(realUrl) return realUrl;
        return sign;
    }


    /**
     * 根目录符号处理, 如果没有配置root，则使用网站根目录
     */
    function replaceRoot(sign){
        if(sign[0] == "@"){
            if(sign[1] == "."){
                console.error("[Suho error] Unknown url \""+ sign +"\"");
                return sign.substr(1);
            }

            if(Suho.root){
                return Suho.root + sign.substr(1);
            }else{
                return "/" + sign.substr(1);
            }
        }else{
            return sign;
        }
    }


    /**
     * 缩写处理
     */
    function replaceAbbr(sign){
        let levels = sign.split("/");
        let fileName = levels.reverse()[0];
        let hasSufix = fileName.lastIndexOf(".") >= 0;
        if(!hasSufix) return sign + ".js";
        return sign;
    }


    /**
     * 生成模块
     */
    let generateModule = function(task, retModule){
        let url = task.url;
        fetchResource( url, "text", function(raw){
            compile(url, raw, retModule);
        });
    }




    /**
     * 获得window的所有属性
     */
    let globalAllProp = Object.getOwnPropertyNames(self);
    let orginaRequire = globalAllProp.indexOf("require");
    if(orginaRequire >= 0){
        globalAllProp.splice(orginaRequire, 1);
    }
    let shadArgs = globalAllProp.join(",");




    /**
     * 解析模块源码，收集必要信息，返回一个构造完毕的模块
     * 一个构造完毕的模块实质上是一个匿名函数，返回值是该模块的导出，且这个函数有且只有一个参数，参数名必须是 "require"
     */
    function compile(url, raw, retModule){
        raw = exportStatment(raw);
        let depends = getDepend(raw);
        depends.forEach(function(dep){
            let url = compileUrl(dep.sign);
            let levels = url.split("/");
            let fileName = levels.reverse()[0];
            let type = fileName.substr(fileName.lastIndexOf("."));
            dep.fileName = fileName;
            dep.type = type;
            dep.url = url;
            //推入任务队列
            waiting.push(dep);
        });
        
        retModule(
            new Function("require" + "                           /* "+ url +" */", raw)
        )
    }



    /**
     * 收集模块源码中的依赖。忽略收集过程中的错误
     */
    function getDepend(raw){
        let depends = [];
        let findDepend = function(url){
            depends.push(url);
        };
        let gatherFn = preCheckCode(raw);
        try {
            gatherFn(
                function findDepend(sign, config){
                    depends.push({sign: sign, config: config});
                }
            );
        } catch (_) {};
        return depends;
    }




    /**
     * 执行语法检查
     */
    function preCheckCode(raw){
        return new Function("require," + shadArgs, raw);
    }



    /**
     * 处理导出语句
     */
    function exportStatment(raw){
        return raw.replace("export:", "return");
    }




    /**
     * 请求获取资源
     */
    function fetchResource(url, resourceType, retRaw){
        let xhr = new XMLHttpRequest();
        xhr.responseType = resourceType || "text";
        watchXhr(url, xhr, retRaw);
    }




    /**
     * 观察ajax请求过程
     */
    function watchXhr(url, xhr, retRaw){
        xhr.open("GET", url, true);
        xhr.send();
        xhr.onload = function(){
            let statu = xhr.status;
            if(statu >= 200 && statu < 300 || statu == 304){
                retRaw(xhr.response);
            }else{
                retRaw("");
            }
        }
    }





    /**
     * error log
     */
    function error(msg){
        console.error("[Suho error] " + msg);
    }

    /**
     * 
     */
    function warn(msg){
        console.log("[Suho warn] " + msg);
    }




    /**
     * loader仓库
     */
    const loaders = new Map();


    /**
     * 生成自定义模块
     */
    function generateCustomModule(task, retModule){
        //如果用户请求定义loader
        if(task.config && task.config.loader){
            fetchResource( task.url, "text", function(raw){
                retModule(
                    defineLoader(raw, task.config.loader)
                );
            });
            return;
        }

        //尝试获取loader
        let loader = loaders.get(task.type);

        //如果没有对应的loader，就返回 字符串模块
        if(!loader){
            fetchResource( task.url, "text", function(raw){
                retModule(
                    raw
                );
            });
            return;
        }

        //如果有对应的loader，用loader解释后返回模块
        fetchResource( task.url, loader.responseType, function(res){
            let dist = null;
            try { dist = loader.make(res); } 
            catch (error) {
                console.error(error);
            }
            retModule(
                dist
            );
        });
    }




    /**
     * 定义loader
     */
    function defineLoader(raw, format){
        //用于收集调节参数的对象
        let collect = {
            __proto__: null,

            responseType: "text",
            format: format,
            make: function(_){ return _ },
            normalExport: null
        };
        //构造
        let defFn = new Function("$set", raw);
        defFn(collect);
        //存储loader
        format = collect.format;
        if(typeof format === "string"){
            loaders.set(format, collect);
        }
        if(format instanceof Array){
            format.forEach(function(f){
                loaders.set(f, collect);
            });
        }
        return collect.normalExport;
    }



    /**
     * 批量映射别名
     */
    function aliasMapping(map){
        for(let key in map){
            if(key[0] == "@"){
                console.error("[Suho error] Aliases cannot start with \"@\"");
                continue;
            }
            alias.set(key, map[key]);
        }
    }



    /**
     * 配置接口
     */
    const Suho = {};
    Suho.alias = aliasMapping;




    /**
     * 从当前script节点上获取入口脚本的url
     */
    let mainModUrl = document.currentScript.getAttribute("suho-main");
    let configUrl  = document.currentScript.getAttribute("suho-config");


    /**
     * 运行配置脚本
     */
    if(configUrl){
        loadAndRunConfig(configUrl);
    }else{
        doWork();
    }



    /**
     * 当入口模块被生成后，此变量应该被替换成入口模块，否则默认函数被运行了说明内部出错了
     */
    let mainMod = function(){
        error(
            "The main module failed to load"
        );
    }

    /**
     * 生成入口模块
     */
    function doWork(){
        generateModule(
            {url: mainModUrl}, 
            function(module) {
                mainMod = module;
                snail_crawl(produce);
            }
        );
    }



    /**
     * 当所有所需的模块都被正确地加载到了环境中后，调用此函数开启正常业务流程，进入生产环节，
     * 并且确保此函数被调用时页面已经加载完毕了
     */
    function produce() {
        //确保运行时页面已经加载完毕了
        if (document.readyState == "complete") {
            mainMod(require);
        } else {
            document.addEventListener("readystatechange", function () {
                if (document.readyState == "complete"){
                    mainMod(require);
                }
            })
        }
    }




    /**
     * 加载并运行配置脚本
     * @todo 完善配置脚本特性
     */
    function loadAndRunConfig(url){
        fetchResource(url, "text", function(raw){
            var configFn = new Function("Suho                        /* config */", raw);
            configFn(Suho);
            doWork();
        });
    }




    /**
     * 从模块库中取用一个模块
     */
    function require(sign, _){
        let mod = modules.get(sign);
        let $ = mod.$;
        return typeof $ === "function"
            ? $(require)
            : $;
    }
}());