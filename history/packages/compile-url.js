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


