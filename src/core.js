
import { shallowExtend, deepExtend } from "./utils.js";
import { dataUser } from "./data.js";
function jQueryObject(selector) {
    if (selector instanceof jQueryObject)
        return selector;
    if (selector.length > 0 && selector[0] && selector[0].nodeType) { //selector is not jQueryObject instance but still have [0] = element
        for (let i = 0; i < selector.length; i++)
            this[i] = selector[i];
        this.length = selector.length;
    }
    else if (selector.nodeType) {
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
        else if (!arguments || arguments?.length == 0) {
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
        else if (!arguments || arguments?.length == 0) {
            return jQueryObj[0].value;
        }
    },
    css: function() {
        let cssCamelcaseProperty = function(cssProperty) {
            return cssProperty.replace(/-([a-z])/g, (fullMatch, captureCharacter) => {
                return captureCharacter.toUpperCase();
            });
        };
        const jQueryObj = this;
        if (arguments.length == 2) {
            let cssPropertyName = arguments[0];
            let value = arguments[1];
            return jQuery.each(jQueryObj, function() {
                const element = this;
                const camelProperty = cssCamelcaseProperty(cssPropertyName);
                element.style[camelProperty] = value;
            });
        }
        else if (arguments.length == 1 && typeof arguments[0] == 'object')  {
            const cssProperties = arguments[0];
            return jQuery.each(jQueryObj, function() {
                const element = this;
                for (const [cssPropertyName, value] of Object.entries(cssProperties)) {
                    const camelProperty = cssCamelcaseProperty(cssPropertyName);
                    element.style[camelProperty] = value;
                }
            });
        }
        else if (arguments.length == 1 && typeof arguments[0] == 'string')  {
            const cssPropertyName = arguments[0];
            const camelProperty = cssCamelcaseProperty(cssPropertyName);
            let result = getComputedStyle(jQueryObj[0])[camelProperty];
            return result ?? jQueryObj[0].style[camelProperty];
        }
        else if (!arguments || arguments?.length == 0) {
            let result = jQueryObj[0].style;
            return result;
        }
    },
    hasClass: function(className) {
        const jQueryObj = this;
        const result = Array.prototype.some.call(jQueryObj, (element) => element.classList.contains(className));
        return result;
    },
    addClass: function(className) {
        const jQueryObj = this;
        return jQuery.each(jQueryObj, function() {
            const element = this;
            element.classList.add(className);
        });
    },
    removeClass: function(className) {
        const jQueryObj = this;
        return jQuery.each(jQueryObj, function() {
            const element = this;
            element.classList.remove(className);
        });
    },
    toggleClass: function(className) {
        const jQueryObj = this;
        return jQuery.each(jQueryObj, function() {
            const element = this;
            element.classList.toggle(className);
        });
    },
    data: function(name, value) {
        const jQueryObj = this;
        const element = jQueryObj[0];
        if (name === undefined) return dataUser.get(element);
        if (value === undefined) return dataUser.access(element, name);
        else {
            return jQuery.each(jQueryObj, function() {
                const element = this;
                dataUser.access(element, name, value);
            });
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
};
//TODO: jQuery.extends({ something: ...}) will extend the jQuery itself, so we can import jQuery, and add functionality in different module, more scalable
jQuery.hasData = function(element) {
    return dataUser.hasData(element);
};
jQuery.data = function(element, name, value) {
    return dataUser.access(element, name, value);
};
jQuery.removeData = function(element, name) {
    dataUser.remove(element, name);
};    
//NOTE: if Query.fn = jQuery.prototype is after jQueryObject.prototype = jQuery.fn, then prototype of instance not have these methods: shallowExtend, ....
// jQuery.fn = jQuery.prototype = {
//     shallowExtend: shallowExtend,
//     deepExtend: deepExtend,
// }

//IIFE to ensure, all var in this file not polute window global object, only jQuery & $
//this is a module already act as IIFE because contains EXPORT

//It must be loaded via import. It must be executed as an ES module. It cannot be a normal global script <script src="core.js"></script>
//=> No pollute globals window
export { jQuery, jQuery as $ } //only these 2 public as we export