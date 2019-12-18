let suho = require("suho");

module.exports = {
    entry: "index.js",
    // entry: "../dirA/dirB/abc.yuu",
    modules: "/node_modules",   // 第三方模块根目录
    loaders: [
        {
            id: "raw-loader",
            path: "@raw-loader"
        },
        {
            id: "html-loader",
            path: "@html-loader"
        },
        {
            id: "yuu-loader",
            path: "/src/myloader/yuu-loader.js"
        }
    ],
    rules: [
        {
            suffix: [".html", ".htm", ".xhtml"],
            rawType: suho.rawType.text,
            useLoader: ["raw-loader", "html-loader"]
        },
        {
            suffix: [".yuu"],
            useLoader: ["raw-loader", "yuu-loader"]
        }
    ]
}