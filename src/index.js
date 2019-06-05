import Vue from 'web/entry-runtime-with-compiler.js';

window.__WEEX__ = true;

new Vue({
    el: '#app',
    template: '<div>{{ message }}</div>',
    data: {
        message: 'Hello World!'
    }
});
