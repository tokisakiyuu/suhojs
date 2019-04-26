$set.responseType = "blob";

$set.normalExport = "i'm pngLoader of normal export";

$set.format = ".png";

$set.make = make;


//这个函数的返回一定是一个模块
function make(blob){
    return URL.createObjectURL(blob);
}