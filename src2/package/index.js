buildStore(
    document.currentScript.getAttribute("data-main"), 
    (store) => {
        const main = store.get("main");
        main && main.instance && main.instance();
    }
);