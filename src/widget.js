import { deepExtend } from "./utils.js";
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
export default Widget;