let raw = require("../mod/myHtmMod/htmlMod1.html");

let div = document.createElement("div");
div.innerHTML = raw;

export: div;