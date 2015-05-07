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
    Function.prototype.$bind = function () {
        var
            _r = [], // 参数集
            _args = arguments, // 获取参数
            _object = arguments[0], // 获取目标
            _function = this; // this赋值

        // 参数绑定
        return function () {
            var _argc = _r.slice.call(_args, 1);
            _r.push.apply(_argc, arguments);
            return _function.apply(_object || null, _argc);
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