/**
 * 批量映射别名
 */
function aliasMapping(map){
    for(let key in map){
        alias.set(key, map[key]);
    }
}



/**
 * 配置接口
 */
const Suho = {};
Suho.alias = aliasMapping;