exports.make = function(raw){
    return (require, exports) => {
        require("mod/modA");
        const div = document.createElement("div");
        const frag = document.createDocumentFragment();
        let child;
        div.innerHTML = raw;
        while(child = div.firstChild){
            frag.appendChild(child);
        }
        exports.frag = frag;
    };
}

exports.type = ".html";