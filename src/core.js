
import { shallowExtend, deepExtend } from "./utils.js";
import { dataUser } from "./data.js";
import Widget from "./widget.js";
(function(global) {
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
                return jQueryObj[0].style[camelProperty];
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
    /** This method is ensure we have widgetName => we will have $(element).widgetFullName() getter, setter */
    jQuery.widgetBridge = function(name, constructorFn) { 
        let fullName = constructorFn.prototype.widgetFullName || name;
        jQuery.fn[name] = function(options) {
            let isMethodCall = typeof options === "string";
            const jQueryObj = this;
            const args = Array.prototype.slice.call(arguments, 1);
            let returnValue = jQueryObj;
            if (!isMethodCall) { //is init                
                jQuery.each(jQueryObj, function() {
                    const element = this;
                    const instance = jQuery.data(element, fullName);
                    if (!instance)
                        jQuery.data(this, fullName, new constructorFn(options, element));
                    else {
                        instance._setOptions(options);
                        if (instance._init) instance._init();
                    }
                });
            }
            else { //is method call
                if (!jQueryObj.length && options === 'instance') return undefined;
                jQuery.each(jQueryObj, function() {
                    let instance = jQuery.data(this, fullName);
                    if (!instance) throw Error("not initialized");
                    if (options === 'instance') {
                        returnValue = instance;
                        return false; //exits jQuery.each
                    }
                    if (typeof instance[options] == 'function') {
                        returnValue = instance[options].apply(instance, args);
                        return false;
                    }
                });
            } 
            return returnValue;
        }
    }
    /**
     * Minimal flow (mental model) $.widget():
        build constructor -> set prototype chain -> wrap overridden methods -> expose $.fn.plugin
     */
    jQuery.widget = function(inputName, base, prototype) {
        const [namespace, name] = inputName.split(".");
        const fullName = `${namespace}-${name}`;
        if (prototype === undefined) {
            prototype = base;
            base = Widget;
        }

        jQuery[namespace] = jQuery[namespace] || {};
        let constructor = jQuery[namespace][name]  = function(options, element) {
            //!this: Called without new
            //!this._createWidget: Prototype isn’t set yet, or calling for simple inheritance
            if (!this || !this._createWidget)
                return new constructor( options, element );
            if (arguments.length)
                this._createWidget( options, element );
        }

        let basePrototype = new base();
        //not mutate the base 's options from prototype (shared), in case options of base is from prototype
        //obj.options === Base.prototype.options // ✅ true (obj not have options, but get this from its prototype)
        basePrototype.options = jQuery.deepExtend({}, basePrototype.options);

        let proxiedPrototype = {};
        jQuery.each(prototype, function(property, value) {
            if (typeof value !== "function") {
                proxiedPrototype[property] = value;
                return;
            }
            proxiedPrototype[property] = (function() {
                function _super() {
                    return base.prototype[property].apply(this, arguments);
                }

                function _superApply(args) {
                    return base.prototype[property].apply(this, args);
                }

                return function() {
                    //this keyword in this context is the widget instance
                    //save these for later restore
                    let __super = this._super;
                    let __superApply = this._superApply;

                    this._super = _super;
                    this._superApply = _superApply;

                    const returnValue = value.apply(this, arguments); //value is a function
                    this._super = __super;
                    this._superApply = __superApply;
                    return returnValue;
                }
            })()
        });

        constructor.prototype = jQuery.deepExtend(basePrototype, proxiedPrototype, {
            constructor: constructor,
            namespace: namespace,
            widgetName: name,
            widgetFullName: fullName
        });

        jQuery.widgetBridge( name, constructor );
        return constructor;
    }


    //NOTE: if Query.fn = jQuery.prototype is after jQueryObject.prototype = jQuery.fn, then prototype of instance not have these methods: shallowExtend, ....
    // jQuery.fn = jQuery.prototype = {
    //     shallowExtend: shallowExtend,
    //     deepExtend: deepExtend,
    // }

    global.jQuery = global.$ = jQuery;
})(window)
//IIFE to ensure, all var in this file not polute window global object, only jQuery & $
//or could use export { jQuery, jQuery as $ }, then import these 2 from the core.js (module)
