
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

jQuery = (selector) => new jQueryObject(selector);

jQueryObject.prototype = jQuery.fn;

jQuery.fn = jQuery.prototype = {
}
