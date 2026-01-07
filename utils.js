export function deepExtend() {
    let target = arguments[0] || {};
    let otherArgs = Array.prototype.slice.apply(arguments, 1); //other options to override
    for (const obj of otherArgs) {
        if (!obj) continue;
        for (const [key, value] of Object.entries(obj)) {
            switch (Object.prototype.toString.call(value)) {
                case '[object Object]':
                    target[key] = target[key] || {};
                    target[key] = jQuery.fn.extend(target[key], value);
                    break;
                case '[object Array]': //review case array
                    target[key] = jQuery.fn.extend(new Array(value.length), value);
                    break;
                default:
                    target[key] = value;
            }
        }
    }
}

export function shallowExtend(target, ...sources) {
    for (const src of sources) {
        if (!src) continue;
        for (const [key, value] of Object.entries(src)) {
            target[key] = value;
        }
    }
}