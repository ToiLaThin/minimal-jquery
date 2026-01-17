import { jQuery } from "./core.js";
import { deepExtend } from "./utils.js";
(function($){
    //this stay private inside this module, this will import jQuery and extends it
    let Widget = function() {};
    Widget.prototype = {
        options: {
            classes: {},
            disabled: false,
        },

        _createWidget: function(options, element) {
            this.options = deepExtend({}, this.options, options);
            this._create();
            this._init();
        },
        _create: function() {},
        _init: function() {},
        _destroy: function() {},
        _setOption: function(key, value) {
            this.options[key] = value;
            return this;
        },
        _setOptions: function(options) {
            for (const key in options )
                this._setOption( key, options[key] );
            return this;
        }
    }
    //can export default Widget; if needed in other modules 

    /** This method is ensure we have widgetName => we will have $(element).widgetFullName() getter, setter */
    $.widgetBridge = function(name, constructorFn) { 
        let fullName = constructorFn.prototype.widgetFullName || name;
        $.fn[name] = function(options) {
            let isMethodCall = typeof options === "string";
            const jQueryObj = this;
            const args = Array.prototype.slice.call(arguments, 1);
            let returnValue = jQueryObj;
            if (!isMethodCall) { //is init                
                $.each(jQueryObj, function() {
                    const element = this;
                    const instance = $.data(element, fullName);
                    if (!instance)
                        $.data(this, fullName, new constructorFn(options, element));
                    else {
                        instance._setOptions(options);
                        if (instance._init) instance._init();
                    }
                });
            }
            else { //is method call
                if (!jQueryObj.length && options === 'instance') return undefined;
                $.each(jQueryObj, function() {
                    let instance = $.data(this, fullName);
                    if (!instance) throw Error("not initialized");
                    if (options === 'instance') {
                        returnValue = instance;
                        return false; //exits $.each
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
    $.widget = function(inputName, base, prototype) {
        const [namespace, name] = inputName.split(".");
        const fullName = `${namespace}-${name}`;
        if (prototype === undefined) {
            prototype = base;
            base = Widget;
        }

        $[namespace] = $[namespace] || {};
        let constructor = $[namespace][name]  = function(options, element) {
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
        basePrototype.options = $.deepExtend({}, basePrototype.options);

        let proxiedPrototype = {};
        $.each(prototype, function(property, value) {
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

        constructor.prototype = $.deepExtend(basePrototype, proxiedPrototype, {
            constructor: constructor,
            namespace: namespace,
            widgetName: name,
            widgetFullName: fullName
        });

        $.widgetBridge( name, constructor );
        return constructor;
    }
})(jQuery);