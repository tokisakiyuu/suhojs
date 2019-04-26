/**!
 * 2019 Yuu
 */



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