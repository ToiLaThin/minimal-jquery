
import { shallowExtend, deepExtend } from "./utils.js";

function jQueryObject(selector) {
    if (selector.nodeType) {
        this.length = 1;
        this[0] = selector;
    }
    else if (typeof selector == 'string') {
        let nodeList = document.querySelectorAll(selector); //an array of nodelist => change it to jquery object
        let index = 0;
        this.length = 0; //Data in constructor, methods in prototype ✅
        for (let node of nodeList) {
            this[index] = node;
            index += 1;
            this.length += 1;
        }
    }
    else 
        return;
    //new jQueryObject implicitly return this
}

let jQuery = (selector) => new jQueryObject(selector);
jQueryObject.prototype = jQuery.fn = jQuery.prototype = { //alias to prototype
    ready: function(callback) {
        let jQueryObj = this;
        const isReady = Array.prototype.some.call(jQueryObj, function(element) {
            return element.readyState != null && element.readyState != "loading";
        });
        if (isReady) {
            callback();
        }
        else {
            jQueryObj.on('DOMContentLoaded', callback);
        }
    },
    each: function(callback) { //suger syntax, now callback exec for each match element of jQuery instance and chainable
        return jQuery.each(this, callback);
    },
    on: function(event, callback) {
        const jQueryObj = this;
        return jQuery.each(jQueryObj, function() {
            const element = this;
            element.addEventListener(event, function(e) {
                callback.call(element, e)
            });
        })
    },
    text: function() {
        const jQueryObj = this;
        if (arguments.length == 1) { //setter
            const text = arguments[0];
            return jQuery.each(jQueryObj, function() {
                const element = this;
                element.textContent = text;
            })
        }
        else if (arguments.length == 0 || !arguments) {
            return jQueryObj[0].textContent;
        }
    },
    val: function() {
        const jQueryObj = this;
        if (arguments.length == 1) {
            const value = arguments[0];//if call arguments inside jQuery.each then it is different
            return jQuery.each(jQueryObj, function() {
                const element = this;
                element.value = value;
            })
        }
        else if (arguments.length == 0 || !arguments) {
            return jQueryObj[0].value;
        }
    }
}
jQuery.shallowExtend = shallowExtend;
jQuery.deepExtend = deepExtend;
jQuery.each = function(target, callback) {
    if (target.length > 0) {
        for (let i = 0; i < target.length; i++)
            if (callback.call(target[i], i, target[i]) === false) break; //TODO: not sure why return false will break
    }
    else {
        for (let key in target)
            if (callback.call(target[key], key, target[key]) === false) break;
    }
    return target; //jQuery chainable
}

//NOTE: if Query.fn = jQuery.prototype is after jQueryObject.prototype = jQuery.fn, then prototype of instance not have these methods: shallowExtend, ....
// jQuery.fn = jQuery.prototype = {
//     shallowExtend: shallowExtend,
//     deepExtend: deepExtend,
// }

export { jQuery, jQuery as $ }
