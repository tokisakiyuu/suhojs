module.exports = function(source) {
    return new Promise((resolve, reject) => {
        resolve({content: `yuu file:\n ${source}`});
    })
}