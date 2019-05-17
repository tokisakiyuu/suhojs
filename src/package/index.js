buildStore(
    document.currentScript.getAttribute("data-main"), 
    (store) => {
        const main = store.get("main");
        console.log(store)
        main && main.instance && main.instance();
    }
);