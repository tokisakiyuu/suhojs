//获取组件摘要
let getSummary = (function(){
    let div = document.createElement("div");
    return function(modRaw){
        div.innerHTML = modRaw;
        let jsRaw = "", doc, style;
        let frag = document.createDocumentFragment(), child;
        while(child = div.firstElementChild){
            let nodeName = child.nodeName.toLocaleLowerCase();
            switch (nodeName) {
                case "script":
                    div.removeChild(child);
                    jsRaw = child.innerText;
                    break;
                case "style":
                    frag.appendChild(child);
                    style = child;
                    break;
                default:
                    frag.appendChild(child);
                    doc = child;
            }
        }
        return {
            jsRaw: jsRaw,
            frag: frag,
            doc: doc,
            style: style,
            needModules: requireList(jsRaw)
        }
    }
}());



let REQUIRE_RULE = /require\("(.*)"\)/g;
let REQUIRE_REPLACE = /("\))|(require\(")/g;


//获得引入组件的url列表
let requireList = function(jsRaw){
    let list = jsRaw.match(REQUIRE_RULE);
    if(!list) return [];
    for(let i = 0; i < list.length; i++){
        let curr = list[i];
        list[i] = curr.replace(REQUIRE_REPLACE, "");
    }
    return list;
}