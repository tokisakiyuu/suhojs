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
    let url = waiting.shift();
    //如果已经存在
    if(isExits(url)) {
        return nextTask(onOver);
    }
    //生成模块
    generateModule( url, 
        function(module) {
            modules.set(url, module);
            //继续下个任务
            nextTask(onOver);
        }
    );
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