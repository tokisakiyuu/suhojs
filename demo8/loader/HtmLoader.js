defineLoader([".htm", ".html"], {
    //声明raw的类型
    rawType: "text",
    //以编译方式产出
    translate: function(raw, suffix){
        return `
            let div = document.createElement("div");
            div.innerText = "我是以编译方式产出的模块，后缀为：${suffix}"
            export: div;
        `;
    },
    //以实例方式产出
    make: function(raw, suffix){
        let div = document.createElement("div");
        div.innerText = "i'm a module raw by "+ raw;
        return div;
    }
});