let suho = require("suho");

module.exports = {
    entry: "index.js",
    loaders: [
        {
            id: "raw-loader",
            path: "/src/loaders/raw-loader.js"
        },
        {
            id: "html-loader",
            path: "/src/loaders/html-loader.js"
        }
    ],
    rules: [
        {
            suffix: [".html", ".htm", ".xhtml"],
            rawType: suho.rawType.text,
            useLoader: ["raw-loader", "html-loader"]
        }
    ]
}