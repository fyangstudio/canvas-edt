define(function ($p, $f, $w) {

    // 类型判断
    function _isType(type) {
        return function (obj) {
            return {}.toString.call(obj) == "[object " + type + "]";
        }
    }

    // @return {Boolean}          是否是object
    $p.$isObject = _isType("Object");

    // @return {Boolean}          是否是string
    $p.$isString = _isType("String");

    // @return {Boolean}          是否是array
    $p.$isArray = Array.isArray || _isType("Array");

    // @return {Boolean}          是否是function
    $p.$isFunction = _isType("Function");

    // @return {node}             字符串转HTML
    $p.$parseHTML = function (txt) {
        if (!txt) return;
        var _reg = /<(.*?)(?=\s|>)/i, // first tag name
            _parentNodeMap = {li: 'ul', tr: 'tbody', td: 'tr', th: 'tr', option: 'select'};
        var _tag;
        if (_reg.test(txt)) _tag = _parentNodeMap[(RegExp.$1 || '').toLowerCase()] || '';
        var _cnt = document.createElement(_tag || 'div');
        _cnt.innerHTML = txt;
        var _list = _cnt.childNodes;
        return _list.length > 1 ? _cnt : _list[0];
    }

    // 编码函数
    var _encode = function (_map, _content) {
        _content = '' + _content;
        if (!_map || !_content) {
            return _content || '';
        }
        return _content.replace(_map.r, function ($1) {
            var _result = _map[!_map.i ? $1.toLowerCase() : $1];
            return _result != null ? _result : $1;
        });
    };

    $p.$escape = function (_content) {
        var _map = {
            r: /\<|\>|\&|\r|\n|\s|\'|\"/g,
            '<': '&lt;', '>': '&gt;', '&': '&amp;', ' ': '&nbsp;',
            '"': '&quot;', "'": '&#39;', '\n': '<br/>', '\r': ''
        };
        return _encode(_map, _content);
    };

    $p.$unescape = function (_content) {
        var _map = {
            r: /\&(?:lt|gt|amp|nbsp|#39|quot)\;|\<br\/\>/gi,
            '&lt;': '<', '&gt;': '>', '&amp;': '&', '&nbsp;': ' ',
            '&#39;': "'", '&quot;': '"', '<br/>': '\n'
        };
        return _encode(_map, _content);
    };

    /**
     *字符串前后空白去除
     * @return {String}         - 去除空白后的字符串
     *
     */
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    /**
     *当前函数this拓展
     * @param  {Object}    arg0 - 函数内this
     * @return {Function}       - 绑定后的函数
     *
     */
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {
                },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis || window,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    /**
     *数组遍历
     * @param  {Function}  arg0 - 回调函数
     * @param  {Object}    arg1 - 回调函数内this 可空
     *
     * ```javascript
     * [1,2,3,4,5].forEach(function (value, index, array) {
     *     //something
     * })
     * ```
     *
     */
    if (!Array.prototype.forEach) {

        Array.prototype.forEach = function forEach(callback, thisArg) {

            var T, k = 0;

            if (this == null) throw new TypeError("this is null or not defined");
            if (!$p.$isFunction(callback)) throw new TypeError(callback + " is not a function");

            var O = Object(this);
            var len = O.length >>> 0;

            if (thisArg) T = thisArg;

            while (k < len) {

                var kValue;
                if (Object.prototype.hasOwnProperty.call(O, k)) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }

    /**
     *修复低版本(IE 6,7) Object.keys 不能遍历问题
     * @param  {Object}    arg0 - 取键值的目标对象
     *
     * ```javascript
     * console.log(Object.keys({a:1,b:2,c:3}));
     * // [a,b,c]
     * ```
     *
     */
    var DONT_ENUM = "propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor".split(","),
        hasOwn = ({}).hasOwnProperty;
    for (var i in {
        toString: 1
    }) {
        DONT_ENUM = false;
    }
    Object.keys = Object.keys || function (obj) {
        var result = [];
        for (var key in obj) if (hasOwn.call(obj, key)) {
            result.push(key)
        }
        if (DONT_ENUM && obj) {
            for (var i = 0; key = DONT_ENUM[i++];) {
                if (hasOwn.call(obj, key)) {
                    result.push(key);
                }
            }
        }
        return result;
    };
    /**
     *修复低版本(IE 6,7) console报错问题
     *
     */
    if (!$w.console) {
        $w.console = {
            log: $f,
            warn: $f,
            error: $f
        };
    }

    return $p;
})