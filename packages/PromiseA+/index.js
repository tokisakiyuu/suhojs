// from https://github.com/xieranmaya/blog/issues/3

//构造
function Promise(exec){
    let me = this;
    me.statu = "等待中";
    me.data = undefined;
    me.onDoneCallback = [];
    me.onFailCallback = [];


    function done(val){
        setTimeout(function(){
            if(me.statu == "等待中"){
                me.statu = "已完成";
                me.data = val;
                for(let i = 0; i < me.onDoneCallback.length; i++){
                    me.onDoneCallback[i](val);
                }
            }
        }, 0);
    }


    function fail(reason){
        setTimeout(function(){
            if(me.statu == "等待中"){
                me.statu = "已拒绝";
                me.data = reason;       //拒绝的理由 或 异常对象
                for(let i = 0; i < me.onFailCallback.length; i++){
                    me.onFailCallback[i](reason);
                }
            }
        }, 0);
    }



    try {
        exec(done, fail);
    }catch (e) {
        fail(e);
    }
}


Promise.prototype.then = function(onDone, onFail){
    let me = this;
    let promise2;

    //根据标准，如果then的参数不是function，则需要忽略它
    onDone = typeof onDone == "function" ? onDone : function(val){ return val};
    onFail = typeof onFail == "function" ? onFail : function(reason){ return reason};

    if(me.statu == "已完成"){
        return new Promise(function(done, fail){
            setTimeout(function(){
                try{
                    let x = onDone(me.data);
                    if(x instanceof Promise){
                        x.then(done, fail);
                    }else{
                        done(x);
                    }
                }catch (e) {
                    fail(e);
                }
            }, 0);
        })
    }

    if(me.statu == "已拒绝"){
        return new Promise(function(done, fail){
            setTimeout(function(){
                try{
                    let x = onFail(me.data);
                    if(x instanceof Promise){
                        x.then(done, fail);
                    }else{
                        done(x);
                    }
                }catch (e) {
                    fail(e);
                }
            }, 0);
        })
    }

    if(me.statu == "等待中"){
        return new Promise(function(done, fail){
            me.onDoneCallback.push(function(val){
                try{
                    let x = onDone(me.data);
                    if(x instanceof Promise){
                        x.then(done, fail);
                    }
                }catch (e) {
                    fail(e);
                }
            });

            me.onFailCallback.push(function(reason){
                try{
                    let x = onFail(me.data);
                    if(x instanceof Promise){
                        x.then(done, fail);
                    }
                }catch (e) {
                    fail(e);
                }
            });
        })
    }
}


// 为了下文方便，我们顺便实现一个catch方法
Promise.prototype.catch = function(onFail) {
    return this.then(null, onFail);
}