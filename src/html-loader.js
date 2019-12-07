let C = require("./modC")       // loader也能引用普通模块
console.log("in html-loader: " + C());


let div = document.createElement("div");

function toDom(text) {
    div.innerHTML = text;
    let fragment = document.createDocumentFragment();
    while(div.firstElementChild){
        fragment.appendChild(div.firstElementChild);
    }
    return fragment;
}

module.exports = function(source, text){
    if(text) return toDom(text);
    return source.text()
        .then(htmltext => {
            return toDom(htmltext)
        })
}