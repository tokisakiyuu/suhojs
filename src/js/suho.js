/*!
 * Suho.js v1.0.2
 * 2019 Yuu
 */



/**
 * 模块仓库。
 * 它用来存放已经被加载的模块，这里的模块全部都已经准备就绪了。
 * 模块是以键值对的形式存放的，便于在取用时快速响应，形式是 {url -> Module}
 * "url"是指模块的网络地址，Module是指一个内建的模块对象
 * @todo 干掉Module对象，把 {url -> Module} 变成 {url -> $executor}
 */
let modules = new Map();


/**
 * 加载器仓库。
 * 它用来存放已经被加载的加载器，{url -> $loader}
 * @todo 定义loader的接口灵活性太低了，需要改进为一个新的方式
 */
let loaders = new Map();



/**
 * 这是一个任务队列，从队头开始，取出一个任务执行一个任务，直到没有
 */
let wait = [];



/**
 * 向模块仓库中添加一个模块
 * @param {Module} mod 
 */
let addModule = function (mod) {
    modules.set(mod.url, mod);
}



/**
 * 从模块仓库中获取一个模块并执行，为调用者 构建实例 或者 返回实例
 * @param {string} url 
 * @returns {*}
 * @todo 或许可以尝试 内建一些可供开发者调用的模块，比如 自定义loader模块
 */
let getModule = function (url) {
    if (typeof url != "string") return;
    let mod = modules.get(url);
    return mod.$executor
        ? mod.$executor(getModule)        //如果是执行器，返回执行器的返回
        : mod.$instance;                    //如果是实例，直接返回
}



/**
 * 定义加载器，suffix可以是一个包含种文件后缀的数组
 */
let defineLoader = function (suffix, loader) {
    if (suffix instanceof Array) {
        while (suffix[0]) {
            let sym = suffix.shift();
            loaders.set(sym, loader);
        }
    } else if (typeof suffix == "string") {
        loaders.set(suffix, loader);
    }
}














/**
 * 模块类
 */
let Module = function (url, callback) {
    this.onload = callback || function () { };
    this.depend = [];
    this.url = url;
    this.suffix = url.substring(url.lastIndexOf("."));
    this.loader = loaders.get(this.suffix) || {};
    this.init(url);
}

//初始化模块
Module.prototype.init = function () {
    let me = this;
    //如果这模块被加载过，就直接取出来返回不再加载了
    if (modules.has(this.url)) {
        if (typeof me.onload == "function") {
            return me.onload(modules.get(me.url));
        }
    }
    //请求模块
    this.fetch(function (modRaw) {
        me.raw = modRaw;
        me.compile(modRaw);
        if (typeof me.onload == "function") {
            me.onload(me);
        }
    });
}

//异步请求模块资源
Module.prototype.fetch = function (retRaw) {
    let xhr = new XMLHttpRequest();
    xhr.responseType = this.loader.rawType || "text";       //如果loader定义了raw的类型就使用定义 否则默认 text 类型
    xhr.open("GET", this.url, true);
    xhr.send();
    xhr.onload = function () {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            retRaw(xhr.response);
        }
    }
}

//编译suhojs的模块语法 2.0
Module.prototype.compile = function (raw) {
    //如果有loader中定义了 translate(以编译方式产出模块) 或者 make(以实例方式产出模块) 函数，则使用函数，优先使用 make 函数
    if (this.loader.make) {
        return this.$instance = this.loader.make(raw, this.suffix);     //直接返回实例，跳过常规处理
    } else if (this.loader.translate) {
        raw = this.loader.translate(raw, this.suffix);
    }

    //继续常规处理
    let me = this;
    //处理export:语句。
    raw = raw.replace("export:", "return");
    //存放require的参数，
    let requireUrlArgs = [];
    let requireOtherArgs = [];
    //收集require参数的handle，
    let collectFn;
    //借此机会可以做一个语法错误预检。
    try {
        collectFn = new Function("require", raw);
    } catch (e) {
        return console.error("[Suho error] Found an error in \"" + this.url + "\" at Pre-check.\n" + e);
    }
    //运行这个收集过程，忽略报错，运行完之后将收集到这个模块内所有require的参数
    try {
        collectFn(function (arg) {
            if (typeof arg == "string") {                 //string类型的是url
                me.depend.push(arg);    //放进依赖表
                requireUrlArgs.push(arg);
            }
            if (typeof arg == "object") {                 //是loader引入
                wait.push(arg); //直接以最高优先级排进加载队伍
            }
        });
    } catch (e) { }
    this.$executor = new Function("require", raw);
}









/**
 * ============ 框架入口 ===========
 */
//获取主模块
let mainModUrl = document.currentScript.getAttribute("suho-main");
let mainMod = new Module(mainModUrl, function (mod) {
    addModule(mod);
    let waitTask = [].slice.call(mod.depend);
    for (let i = 0; i < waitTask.length; i++) {
        wait.push(waitTask[i]);
    }
    //开启loop(轮询任务)
    snail_crawl(runProcess);
});










/**
 * 主loop
 */
//蜗牛爬行
//递归获取模块
let snail_crawl = function (onAllLoad) {
    if (!wait.length) return onAllLoad();    //任务爬完了，执行完成回调
    //队列中第一个任务来执行
    let url = wait.shift();
    //如果是对象，说明是一个加载loader的请求（至少现在是）
    if (url.loader) {
        return fetchLoader(url.loader, function (loaderRaw) {
            registLoader(loaderRaw);
            snail_crawl(onAllLoad); //继续爬行任务
        });
    }
    //加载模块
    let mod = new Module(url, function (loadMod) {
        addModule(loadMod);
        let waitTask = [].slice.call(loadMod.depend);
        for (let i = 0; i < waitTask.length; i++) {
            wait.push(waitTask[i]);
        }
        snail_crawl(onAllLoad); //继续爬行任务
    });
}






/**
 * loader管理
 */
//加载loader
//异步请求模块资源
let fetchLoader = (function () {
    let xhr = new XMLHttpRequest();
    return function (url, retRaw) {
        xhr.responseType = "text";
        xhr.open("GET", url, true);
        xhr.send();
        xhr.onload = function () {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                retRaw(xhr.response);
            }
        }
    }
}());

//注册loader
let registLoader = function (loaderRaw) {
    try {
        let tryRegistFn = new Function("defineLoader", loaderRaw);
        tryRegistFn(defineLoader);
    } catch (e) {
        console.log("[Suho error] Found an error in Loader:\"" + this.url + "\" at Pre-check.\n" + e);
    }
}







/**
 * 正式运行用户脚本
 */
//所有模块准备完毕，开始运行
let runProcess = function () {
    //确保运行时页面已经加载完毕了
    if (document.readyState == "complete") {
        getModule(mainModUrl);
    } else {
        document.addEventListener("readystatechange", function () {
            if (document.readyState == "complete")
                getModule(mainModUrl);
        })
    }
}