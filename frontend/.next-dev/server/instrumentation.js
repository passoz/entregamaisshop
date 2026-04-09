"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "instrumentation";
exports.ids = ["instrumentation"];
exports.modules = {

/***/ "(instrument)/./src/instrumentation.ts":
/*!********************************!*\
  !*** ./src/instrumentation.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   register: () => (/* binding */ register)\n/* harmony export */ });\nasync function register() {\n    if (true) {\n        // 1. LocalStorage Polyfill for SSR\n        if (typeof global.localStorage === 'undefined' || typeof global.localStorage?.getItem !== 'function') {\n            global.localStorage = {\n                getItem: ()=>null,\n                setItem: ()=>{},\n                removeItem: ()=>{},\n                clear: ()=>{},\n                length: 0,\n                key: ()=>null\n            };\n        }\n        // 2. MSW Server-side initialization\n        if (false) {}\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGluc3RydW1lbnQpLy4vc3JjL2luc3RydW1lbnRhdGlvbi50cyIsIm1hcHBpbmdzIjoiOzs7O0FBQU8sZUFBZUE7SUFDcEIsSUFBSUMsSUFBcUMsRUFBRTtRQUN6QyxtQ0FBbUM7UUFDbkMsSUFBSSxPQUFPRyxPQUFPQyxZQUFZLEtBQUssZUFBZSxPQUFPLE9BQWdCQSxZQUFZLEVBQUVDLFlBQVksWUFBWTtZQUM1R0YsT0FBZUMsWUFBWSxHQUFHO2dCQUM3QkMsU0FBUyxJQUFNO2dCQUNmQyxTQUFTLEtBQU87Z0JBQ2hCQyxZQUFZLEtBQU87Z0JBQ25CQyxPQUFPLEtBQU87Z0JBQ2RDLFFBQVE7Z0JBQ1JDLEtBQUssSUFBTTtZQUNiO1FBQ0Y7UUFFQSxvQ0FBb0M7UUFDcEMsSUFBSVYsS0FBaUQsRUFBRSxFQUl0RDtJQUNIO0FBQ0YiLCJzb3VyY2VzIjpbIi9hcHAvc3JjL2luc3RydW1lbnRhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXIoKSB7XG4gIGlmIChwcm9jZXNzLmVudi5ORVhUX1JVTlRJTUUgPT09ICdub2RlanMnKSB7XG4gICAgLy8gMS4gTG9jYWxTdG9yYWdlIFBvbHlmaWxsIGZvciBTU1JcbiAgICBpZiAodHlwZW9mIGdsb2JhbC5sb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiAoZ2xvYmFsIGFzIGFueSkubG9jYWxTdG9yYWdlPy5nZXRJdGVtICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAoZ2xvYmFsIGFzIGFueSkubG9jYWxTdG9yYWdlID0ge1xuICAgICAgICBnZXRJdGVtOiAoKSA9PiBudWxsLFxuICAgICAgICBzZXRJdGVtOiAoKSA9PiB7fSxcbiAgICAgICAgcmVtb3ZlSXRlbTogKCkgPT4ge30sXG4gICAgICAgIGNsZWFyOiAoKSA9PiB7fSxcbiAgICAgICAgbGVuZ3RoOiAwLFxuICAgICAgICBrZXk6ICgpID0+IG51bGwsXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIDIuIE1TVyBTZXJ2ZXItc2lkZSBpbml0aWFsaXphdGlvblxuICAgIGlmIChwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19BUElfTU9DS0lORyA9PT0gJ2VuYWJsZWQnKSB7XG4gICAgICBjb25zdCB7IHNlcnZlciB9ID0gYXdhaXQgaW1wb3J0KCdAL21vY2tzL3NlcnZlcicpO1xuICAgICAgc2VydmVyLmxpc3Rlbih7IG9uVW5oYW5kbGVkUmVxdWVzdDogJ2J5cGFzcycgfSk7XG4gICAgICBjb25zb2xlLmxvZygnTVNXOiBTZXJ2ZXItc2lkZSB3b3JrZXIgc3RhcnRlZCEnKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJyZWdpc3RlciIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1JVTlRJTUUiLCJnbG9iYWwiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwic2V0SXRlbSIsInJlbW92ZUl0ZW0iLCJjbGVhciIsImxlbmd0aCIsImtleSIsIk5FWFRfUFVCTElDX0FQSV9NT0NLSU5HIiwic2VydmVyIiwibGlzdGVuIiwib25VbmhhbmRsZWRSZXF1ZXN0IiwiY29uc29sZSIsImxvZyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(instrument)/./src/instrumentation.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(instrument)/./src/instrumentation.ts"));
module.exports = __webpack_exports__;

})();