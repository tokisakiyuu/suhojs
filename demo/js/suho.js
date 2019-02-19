(function(global, factory){
    factory();
}(this, (function(){

    //定义元素
    class SUHOElement extends HTMLElement {
        // Specify observed attributes so that
        // attributeChangedCallback will work
        static get observedAttributes() {
            return ['path'];
        }

        constructor() {
            super();

            const shadow = this.attachShadow({mode: 'open'});

        }

        connectedCallback() {
            console.log('Custom square element added to page.');
        }

        disconnectedCallback() {
            console.log('Custom square element removed from page.');
        }

        adoptedCallback() {
            console.log('Custom square element moved to new page.');
        }

        attributeChangedCallback(name, oldValue, newValue) {
            console.log('Custom square element attributes changed.');
        }
    }

    customElements.define('suho-app', SUHOElement);




})));