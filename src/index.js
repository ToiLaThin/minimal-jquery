import { jQuery, $ } from "./core.js";
//this execute the iife in position & widget, so extends the jQuery with position & widget
import "./position.js";
import "./widget.js";

//IIFE to ensure, all var in this file not polute window global object, only jQuery & $
(function(global){
    global.jQuery = global.$ = jQuery;
})(window)