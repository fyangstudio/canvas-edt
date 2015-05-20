define(function ($p, $f, $w) {
    var _doc = document;
    var _noop = $f;

    if (_doc.addEventListener) {
        $p.$addEvent = function (node, type, fn) {
            node.addEventListener(type, fn, false);
        }
        $p.$removeEvent = function (node, type, fn) {
            node.removeEventListener(type, fn, false)
        }
    } else {
        $p.$addEvent = function (node, type, fn) {
            node.attachEvent('on' + type, fn);
        }
        $p.$removeEvent = function (node, type, fn) {
            node.detachEvent('on' + type, fn);
        }
    }

    // 类型判断
    function _isType(type) {
        return function (obj) {
            return {}.toString.call(obj) == '[object ' + type + ']';
        }
    }

    // @return {Boolean}          是否是object
    $p.$isObject = _isType('Object');

    // @return {Boolean}          是否是string
    $p.$isString = _isType('String');

    // @return {Boolean}          是否是array
    $p.$isArray = Array.isArray || _isType('Array');

    // @return {Boolean}          是否是function
    $p.$isFunction = _isType('Function');

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
            if (!$p.$isFunction(this)) {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable!');
            }
            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fBound = function () {
                    return fToBind.apply(this instanceof _noop && oThis ? this : oThis || window,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };
            _noop.prototype = this.prototype;
            fBound.prototype = new _noop();

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
            if (this == null) throw new TypeError('this is null or not defined!');
            if (!$p.$isFunction(callback)) throw new TypeError(callback + ' is not a function!');

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
    if (!Object.keys) {
        Object.keys = (function () {
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
                dontEnums = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ],
                dontEnumsLength = dontEnums.length;

            return function (obj) {
                if (typeof obj !== 'object' && !$p.$isFunction(obj) || obj === null) throw new TypeError('Object.keys called on non-object');

                var result = [];

                for (var prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) result.push(prop);
                }

                if (hasDontEnumBug) {
                    for (var i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
                    }
                }
                return result;
            }
        })()
    }

    if (!window.JSON) {
        var _json = {};
        _json.parse = function (json) {
            if (json === null) return json;
            if ($p.$isString(json)) {
                json = json.trim();
                if (json) return ( new Function('return ' + json) )();
            }
            throw new Error('Invalid JSON: ' + json);
        }
        _json.stringify = function (obj) {

            if (typeof (obj) != "object" || obj === null) {
                if ($p.$isString(obj)) obj = '"' + obj + '"';
                return String(obj);
            }
            else {
                var json = [], arr = $p.$isArray(obj), stringify = arguments.callee;
                for (var key in obj) {
                    var v = obj[key];
                    if ($p.$isString(v)) v = '"' + v + '"';
                    else if (typeof (v) == "object" && v !== null) v = stringify(v);
                    json.push((arr ? "" : '"' + key + '":') + String(v));
                }
                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        };
        window.JSON = _json;
    }

    /**
     *修复低版本(IE 6,7) console报错问题
     *
     */
    if (!$w.console) {
        $w.console = {
            log: _noop,
            warn: _noop,
            error: _noop
        };
    }

    // on自定义事件
    $p.$on = function (event, fn) {
        if (typeof event === "object") {
            var _on = arguments.callee;
            for (var i in event) {
                _on(i, event[i]);
            }
        } else {
            var _handles = this._handles || (this._handles = {}),
                _calls = _handles[event] || (_handles[event] = []);
            _calls.push(fn);
        }
        return this;
    }

    // off去除自定义事件
    $p.$off = function (event, fn) {
        if (!this._handles) return;
        if (!event) this._handles = {};
        var _handles = this._handles, _calls;

        if (_calls = _handles[event]) {
            if (!fn) {
                _handles[event] = [];
                return this;
            }
            for (var i = 0, l = _calls.length; i < l; i++) {
                if (fn === _calls[i]) {
                    _calls.splice(i, 1);
                    return this;
                }
            }
        }
        return this;
    }

    // @return {node}             字符串转HTML
    $p.$parseHTML = function (txt) {
        if (!txt) return;
        var _reg = /<(.*?)(?=\s|>)/i, // first tag name
            _parentNodeMap = {li: 'ul', tr: 'tbody', td: 'tr', th: 'tr', option: 'select'};
        var _tag;
        if (_reg.test(txt)) _tag = _parentNodeMap[(RegExp.$1 || '').toLowerCase()] || '';
        var _cnt = _doc.createElement(_tag || 'div');
        _cnt.innerHTML = txt;
        var _list = _cnt.childNodes;
        return _list.length > 1 ? _cnt : _list[0];
    };

    // for in
    $p.$forIn = function (obj, callback, thisArg) {
        if (!obj || !callback) return null;
        var _keys = Object.keys(obj);
        for (var i = 0, l = _keys.length, _key, _ret; i < l; i++) {
            _key = _keys[i];
            _ret = callback.call(
                thisArg || null,
                obj[_key], _key, obj
            );
            if (!!_ret) return _key;
        }
        return null;
    };

    // string to object
    $p.$s2o = function (string, _split) {
        var _obj = {};
        var _arr = (string || '').split(_split);
        _arr.forEach(function (_name) {
            var _brr = _name.split('=');
            if (!_brr || !_brr.length) return;
            var _key = _brr.shift();
            if (!_key) return;
            _obj[decodeURIComponent(_key)] = decodeURIComponent(_brr.join('='));
        });
        return _obj;
    };

    // object to string
    // $p.$o2s(obj, '&', !0)
    $p.$o2s = function (_object, _split, _encode) {
        if (typeof (_object) != "object" || _object === null) return JSON.stringify(_object);

        var _arr = [];
        $p.$forIn(_object, function (_value, _key) {
            if ($p.$isFunction(_value)) return;
            _value = JSON.stringify(_value);

            if (!!_encode) _value = encodeURIComponent(_value);
            _arr.push(encodeURIComponent(_key) + '=' + _value);
        });
        return _arr.join(_split || ',');
    };

    // clone
    $p.$clone = function (target, deep) {

        var cloned, _deep = !!deep, cloneObject = arguments.callee;
        if (!!target.nodeType) return target.cloneNode(_deep);
        if (target === null || target === undefined || typeof(target) !== 'object') return target;

        if ($p.$isArray(target)) {
            if (!_deep) return target;
            cloned = [];
            for (var i in target) if (target.hasOwnProperty(i)) cloned.push(cloneObject(target[i], _deep));
            return cloned;
        }

        cloned = {};
        for (var i in target) if (target.hasOwnProperty(i)) cloned[i] = _deep ? cloneObject(target[i], true) : target[i];
        return cloned;
    };

    // same
    // ps: in this function Array as Object so use type
    $p.$same = function (target1, target2, deep) {

        var _deep = !!deep, check = arguments.callee;
        if (target1 === target2) return true;
        if (target1.constructor !== target2.constructor) return false;

        // If they are not strictly equal, they both need to be Objects
        if (!( target1 instanceof Object ) || !( target2 instanceof Object )) return false;
        for (var p in target1) {

            if (target1.hasOwnProperty(p)) {
                if (!target2.hasOwnProperty(p)) return false;
                if (target1[p] === target2[p]) continue;

                // Numbers, Strings, Functions, Booleans must be strictly equal
                if (typeof( target1[p] ) !== 'object') return false;

                // Objects and Arrays must be tested recursively
                if (_deep && !check(target1[p], target2[p])) {
                    return false;
                }
            }
        }

        for (p in target2) {
            // allows target1["p"] to be set to undefined
            if (target2.hasOwnProperty(p) && !target1.hasOwnProperty(p)) return false;
        }
        return true;
    };

    var _hash = window.location.hash;
    var _hashFns = [];

    /* hash
     ---------------------------------------------------------------------- */
    $p.$hash = function (value) {
        if (value != undefined) window.location.hash = value;
        return window.location.hash.replace('#', '');
    };

    $p.$watchHash = function (callback) {
        if ($p.$isFunction(callback)) {
            if (('onhashchange' in window) && ((typeof _doc.documentMode === 'undefined') || _doc.documentMode == 8)) {
                $p.$addEvent(window, 'hashchange', function () {
                    _hash = $p.$hash();
                    callback(_hash);
                })
            } else {
                _hashFns.push(callback);
                setInterval(function () {
                    var _h = window.location.hash.replace('#', '');
                    if (_h != _hash) {
                        _hashFns.forEach(function (_fn) {
                            _fn.call(this, _h);
                        })
                        _hash = $p.$hash();
                    }
                }, 150);
            }
        }
    }

    /* request
     ---------------------------------------------------------------------- */
    var _ajaxHandler = function () {
    }
    _ajaxHandler.prototype = {

        // ajax 请求
        _request: function (config) {
            if (!!config.url) {
                var
                    _method = config.method || 'GET',       // ajax请求方法
                    _url = config.url,                      // ajax请求地址
                    _data = config.data || null,            // ajax post数据
                    _dataType = config.dataType || 'JSON',  // 回调类型
                    _success = config.success || _noop,     // 请求成功回调函数
                    _error = config.error || _noop,         // 请求失败回调函数
                    _xhr = this._createXhrObject();
                _xhr.onreadystatechange = function () {
                    if (_xhr.readyState !== 4) return;
                    var _responseData = _dataType == 'JSON' ? JSON.parse(_xhr.responseText) : _xhr.responseText;
                    (_xhr.status === 200) ? _success(_responseData) : _error(_xhr.status);
                };
                _xhr.open(_method, _url, true);
                if (_method !== 'POST') _data = null;
                _xhr.send(_data);
            }
        },
        _createXhrObject: function () {
            var _methods = [
                function () {
                    return new XMLHttpRequest();
                },
                function () {
                    return new ActiveXObject('Msxml2.XMLHTTP');
                },
                function () {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                }
            ];
            for (var i = 0, l = _methods.length; i < l; i++) {
                try {
                    _methods[i]();
                } catch (e) {
                    continue;
                }
                this._createXhrObject = _methods[i];
                return _methods[i]();
            }
            throw new Error('Could not create an XHR object');
        }
    }

    $p.$ajax = function (config) {
        if ($p.$isObject(config)) return new _ajaxHandler()._request(config);
        else throw new Error('Ajax parameter error');
    }

    /* encode decode
     ---------------------------------------------------------------------- */
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

    function api(query, context) {

        context = context || _doc;

        //调用原生选择器
        if (context.querySelectorAll) {
            return context.querySelectorAll(query);
        } else {
            //调用自定义选择器
            return interpret(query, context);
        }

    }

    //解释执行dom选择符
    function interpret(query, context) {
        var parts = query.replace(/\s+/, ' ').split(' ');
        var part = parts.pop();
        var selector = Factory.create(part);
        var ret = selector.find(context);

        return (parts[0] && ret[0]) ? filter(parts, ret) : ret;
    }

    //ID选择器
    function IDSelector(id) {
        this.id = id.substring(1);
    }

    IDSelector.prototype = {
        find: function (context) {
            var ret = [];
            ret.push(context.getElementById(this.id));
            return ret;
        },
        match: function (element) {
            return element.id == this.id;
        }
    };
    IDSelector.test = function (selector) {
        var regex = /^#([\w\-_]+)/;
        return regex.test(selector);
    };

    //元素选择器
    function TagSelector(tagName) {
        this.tagName = tagName.toUpperCase();
    }

    TagSelector.prototype = {
        find: function (context) {
            return context.getElementsByTagName(this.tagName);
        },
        match: function (element) {
            return this.tagName == element.tagName.toUpperCase() || this.tagName === '*';
        }
    };
    TagSelector.test = function (selector) {
        var regex = /^([\w\*\-_]+)/;
        return regex.test(selector);
    };

    //类选择器
    function ClassSelector(className) {
        var splits = className.split('.');

        this.tagName = splits[0] || undefined;
        this.className = splits[1];
    }

    ClassSelector.prototype = {

        find: function (context) {
            var elements;
            var ret = [];
            var tagName = this.tagName;
            var className = this.className;
            var selector = new TagSelector((tagName || '*'));

            //支持原生getElementsByClassName
            if (context.getElementsByClassName) {
                elements = context.getElementsByClassName(className);
                if (!tagName) return elements;
                for (var i = 0, n = elements.length; i < n; i++) {
                    if (selector.match(elements[i])) {
                        ret.push(elements[i]);
                    }
                }
            } else {
                elements = selector.find(context);
                for (var i = 0, n = elements.length; i < n; i++) {
                    if (this.match(elements[i])) {
                        ret.push(elements[i]);
                    }
                }
            }
            return ret;
        },

        match: function (element) {
            var className = this.className;
            var regex = new RegExp('^|\\s' + className + '$|\\s');
            return regex.test(element.className);
        }

    };
    ClassSelector.test = function (selector) {
        var regex = /^([\w\-_]*)\.([\w\-_]+)/;
        return regex.test(selector);
    };

    //根据父级元素过滤
    function filter(parts, nodeList) {
        var part = parts.pop();
        var selector = Factory.create(part);
        var ret = [];
        var parent;

        for (var i = 0, n = nodeList.length; i < n; i++) {
            parent = nodeList[i].parentNode;
            while (parent && parent !== _doc) {
                if (selector.match(parent)) {
                    ret.push(nodeList[i]);
                    break;
                }
                parent = parent.parentNode;
            }
        }
        return (parts[0] && ret[0]) ? filter(parts, ret) : ret;
    }

    //根据查询选择符创建相应选择器对象
    var Factory = {
        create: function (query) {
            if (IDSelector.test(query)) return new IDSelector(query);
            else if (ClassSelector.test(query)) return new ClassSelector(query);
            else return new TagSelector(query);
        }
    };

    $p.dom = {};
    $p.dom.get = api;

    return $p;
})