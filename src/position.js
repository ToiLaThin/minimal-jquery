import { deepExtend } from './utils.js';
import { jQuery } from './core.js';
(function($) {
    function getSizeFunction(extra, dimension) {
        const isWidth = dimension == "width";
        return function(target) {
            if (target === window) {
                const window = target;
                return isWidth ? window.innerWidth : window.innerHeight;
            }
            else if (target.nodeType === 9) {
                const document = target;
                const doc = document.documentElement;
                return isWidth 
                ? Math.max(doc.scrollWidth, doc.offsetWidth, doc.clientWidth)
                : Math.max(doc.scrollHeight, doc.offsetHeight, doc.clientHeight);
            }
            else {
                const element = target;
                const rect = element.getBoundingClientRect(); //include border, padding, margin
                const cssNumber = (property) => parseFloat(getComputedStyle(element)[property]) || 0;
                if (isWidth) {
                    let width = rect.width;
                    if (extra == "content")
                        width = width - cssNumber("paddingLeft") - cssNumber("paddingRight") - cssNumber("borderLeftWidth") - cssNumber("borderRightWidth");
                    else if (extra == "padding")
                        width = width - cssNumber("borderLeftWidth") - cssNumber("borderRightWidth");
                    else if (extra == "border")
                        width = width;
                    else if (extra == "margin")
                        width = width + cssNumber("marginLeft") + cssNumber("marginRight");
                    return width;
                }
                else {
                    let height = rect.height;
                    if (extra == "content")
                        height = height - cssNumber("paddingTop") - cssNumber("paddingBottom") - cssNumber("borderTopWidth") - cssNumber("borderBottomWidth");
                    else if (extra == "padding")
                        height = height - cssNumber("borderTopWidth") - cssNumber("borderBottomWidth");
                    else if (extra == "border")
                        height = height;
                    else if (extra == "margin")
                        height = height + cssNumber("marginTop") + cssNumber("marginBottom");
                    return height;
                }
            }
        }
    }

    const width = getSizeFunction("content", "width");
    const height = getSizeFunction("content", "height");
    const innerWidth = getSizeFunction("border", "width");
    const innerHeight = getSizeFunction("border", "height");
    const outerWidth = getSizeFunction("margin", "width");
    const outerHeight = getSizeFunction("margin", "height");

    $.fn.width = function() {
        const jQueryObj = this;
        return width(jQueryObj[0])
    }

    $.fn.height = function() {
        const jQueryObj = this;
        return height(jQueryObj[0])
    }

    $.fn.innerWidth = function() {
        const jQueryObj = this;
        return innerWidth(jQueryObj[0])
    }

    $.fn.innerHeight = function() {
        const jQueryObj = this;
        return innerHeight(jQueryObj[0])
    }

    $.fn.outerWidth = function() {
        const jQueryObj = this;
        return outerWidth(jQueryObj[0])
    }

    $.fn.outerHeight = function() {
        const jQueryObj = this;
        return outerHeight(jQueryObj[0])
    }

    /** Get the offset compared to parent element */
    function offsetToParent(target) {
        target = $(target);
        const element = target[0];
        const position = target.css("position");
        let offset;
        let offsetParent = { top: 0, left: 0 };
        if (position == "fixed") {
            offset = element.getBoundingClientRect();
            return {
                //this case should compare to viewport only
                top: offset.top - target.css("marginTop"),
                left: offset.left - target.css("marginLeft")
            }
        }
        else {
            offset = target.offset();

            const docElement = element.ownerDocument.documentElement;
            let offsetParentElement = element.offsetParent || docElement;
            let offsetParentElementPosition = $(offsetParent).css("position");
            while (offsetParentElement && offsetParentElement !== docElement && offsetParentPosition == "static") {
                offsetParentElement = offsetParentElement.offsetParent || docElement;
                offsetParentElementPosition = $(offsetParentElement).css("position");
            }

            //just normalize top & left of parent element
            if (offsetParentElement !== element && offsetParentElement.nodeType == 1 && offsetParentElementPosition != "static") {
                $parent = $(offsetParentElement);
                offsetParent = $parent.offset();
                offsetParent.top += parseFloat($parent.css("borderTopWidth"));
                offsetParent.left += parseFloat($parent.css("borderLeftWidth"));
            }
            return {
                top: offset.top - offsetParent.top - parseFloat(target.css("marginTop")),
                left: offset.left - offsetParent.left - parseFloat(target.css("marginLeft"))
            }
        }
    }
    /** Convert the position relative to viewport (getBoundingClientRect) to position relative to document (+ pageYOffset & pageXOffset) */
    $.fn.offset = function(options) {
        const jQueryObj = this;
        const element = jQueryObj[0];
        const rect = element.getBoundingClientRect();
        const window = element.ownerDocument.defaultView;
        const elementOffset = {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
        if (!arguments.length) return elementOffset; //getter, below is setter
        const position = jQueryObj.css("position");
        if (position == "static")
            element.style.position = "relative"; //ensure top and left is not ignored

        let cssTop = jQueryObj.css("top");
        let cssLeft = jQueryObj.css("left");
        if (["absolute", "fixed"].includes(position) || (cssTop + cssLeft).indexOf("auto") > -1) {
            const { top: cssTop, left: cssLeft } = offsetToParent(element);
        }
        else {
            cssTop = parseFloat(cssTop);
            cssLeft = parseFloat(cssLeft);
        }
        const props = {
            //options.top - elementOffset.top (how much to move top). then convert to css value by adding cssTop
            //should have px, otherwise wont works
            top: `${options.top - elementOffset.top + cssTop}px`, 
            left: `${options.left - elementOffset.left + cssLeft}px`
        };
        jQueryObj.css(props);
    }

    function getDimensions(target) {
        target = $(target);
        const element = target.length ? target[0] : target;
        if (element.nodeType === 9)
            return {
                width: target.width(),
                height: target.height(),
                offset: { top: 0, left: 0 }
            }
        if (element != null && element === window)
            return {
                width: target.width(),
                height: target.height(),
                offset: { top: element.scrollTop(), left: element.scrollLeft() } //TODO: not having these functions scrollTop, scrollLeft
            }
        if (element.preventDefault) {
            return {
                width: 0,
                height: 0,
                offset: { top: element.pageY, left: element.pageX }
            }
        }
        return {
            width: target.outerWidth(),
            height: target.outerHeight(),
            offset: target.offset()
        }
    }    

    $.fn.position = function(options) {
        // if (!options || !options.of)
        //     return _position.apply(this, arguments);
        options = deepExtend({}, options); //copy
        const target = $(options.of);
        const { width: targetWidth, height: targetHeight, offset: targetOffset } = getDimensions(target);
        /** The position compared to the target */
        let basePosition = deepExtend({}, targetOffset);
        options.at = options.at || {};
        if (options.at[0] === "right")
            basePosition.left += targetWidth;
        else if (options.at[0] === "center" )
            basePosition.left += targetWidth / 2;

        if (options.at[1] === "bottom")
            basePosition.top += targetHeight;
        else if (options.at[1] === "center" )
            basePosition.top += targetHeight / 2;

        const jQueryObj = this;
        return jQueryObj.each(function() {
            const element = $(this), elementWidth = element.outerWidth(), elementHeight = element.outerHeight();
            let position = deepExtend({}, basePosition);
            options.my = options.my || {};
            if (options.my[0] === "right")
                position.left -= elementWidth;
            else if (options.my[0] === "center")
                position.left -= elementWidth / 2;

            if (options.my[1] === "bottom")
                position.top -= elementHeight;
            else if (options.my[1] === "center")
                position.top -= elementHeight / 2;

            element.offset(position); //setter
        });
    }

})(jQuery);