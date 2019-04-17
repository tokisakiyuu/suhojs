/**
 * Built-in ResourceMap of Suhojs
 * 2019 Yuu
 */


 function resourceMap(require){
    return registAlias;
 }



 /**
  * 检查别名是否已经被使用了
  */
 function isUsed(alias){
    return modules.has(alias);
 }


 /**
  * 检查别名是否合法
  * · 别名不能以 "@" 开头
  * · 别名中不能出现 "/" 字符
  */
 function isLegal(alias){
    return alias[0] == "@" && alias.indexOf("/") < 0;
 }


 /**
  * 注册别名
  * 参数是一个对象
  */
function registAlias(aliasMap){
    for(alias in aliasMap){
        if(isUsed(alias)){
            warn(
                "the alias("+alias+") is used, can not repeat set up it."
            );
        }else if(isLegal(alias)){
            warn(
                "the alias("+alias+") illegal."
            );
        }else{
            //设置别名
        }
    }
}




 modules.set("@ResourceMap", resourceMap);