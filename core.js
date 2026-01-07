
import { shallowExtend, deepExtend } from "./utils.js";

function jQueryObject(selector) {
    if (typeof selector != 'string') return;
    let nodeList = document.querySelectorAll(selector); //an array of nodelist => change it to jquery object
    let index = 0;
    this.length = 0; //Data in constructor, methods in prototype ✅
    for (let node of nodeList) {
        this[index] = node;
        index += 1;
        this.length += 1;
    }
    //new jQueryObject implicitly return this
}

let jQuery = (selector) => new jQueryObject(selector);
jQueryObject.prototype = jQuery.fn = jQuery.prototype = { //alias to prototype
    each: function(callback) { //suger syntax, now callback exec for each match element of jQuery instance and chainable
        return jQuery.each(this, callback);
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
