/**
 * 模块仓库。
 * 它用来存放已经被加载的模块，这里的模块全部都已经准备就绪了。
 * 模块是以键值对的形式存放的，便于在取用时快速响应，形式是 {url -> Module}
 * "url"是指模块的网络地址，Module是指一个内建的模块对象
 */
let modules = new Map();




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