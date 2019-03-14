/**
 * 实现单连接排队请求
 */

let fetchMod = (function(){
    let xhr = new XMLHttpRequest(),
        queue = [],
        allTaskComplete = true,
        fetchMod = function(url, callback){
            xhr.open("GET", url, true);
            xhr.send();
            xhr.onload = function(){
                if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    let task = queue.shift();
                    if(!task) {
                        allTaskComplete = true;
                        callback(xhr.responseText, allTaskComplete);
                        return;
                    }
                    callback(xhr.responseText);
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
}());