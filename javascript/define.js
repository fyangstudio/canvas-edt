(function (_d, _g) {

    // 配置载入方法
    var __config = {site: {}}, // quick site config
        __xqueue = [], // item:{n:'filename',d:[/* dependency list */],p:[/* platform list */],h:[/* patch list */],f:function}
        __scache = {}, // state cache   0-loading  1-waiting  2-defined
        __rcache = {}, // result cache
        __stack = []; // for define stack

    // 工具函数
    var _helper = {
        /*
         * 取事件触发元素
         * @param  {Event} _event 事件对象
         * @return {Void}
         */
        getTarget: function (_event) {
            return !_event ? null : (_event.target || _event.srcElement);
        },
        /*
         * 判断是否字符串
         * @param  {Varable} _data 数据
         * @param  {String}  _type 类型
         * @return {Boolean}       是否字符串
         */
        isTypeOf: function (_data, _type) {
            return Object.prototype.toString.call(_data) === '[object ' + _type + ']';
        },
        /*
         * 查询串转对象
         * @param  {String} _query 查询串
         * @return {Object}        对象
         */
        str2obj: function (_query) {
            var _result = {},
                _list = (_query || '').split('&');
            if (!!_list && !!_list.length)
                for (var i = 0, l = _list.length, _brr, _key; i < l; i++) {
                    _brr = _list[i].split('=');
                    _key = _brr.shift();
                    if (!_key) continue;
                    _result[decodeURIComponent(_key)] = decodeURIComponent(_brr.join('='));
                }
            return _result;
        }
    }
    /*
     * amd载入初始化
     * @return {Void}
     */
    var _doInit = function () {
        var _list = _d.getElementsByTagName('script');
        if (!_list || !_list.length) return;
        var _reg = /\/define\.js(?=\?|#|$)/;
        for (var i = _list.length - 1, _script, _uri; i >= 0; i--) {
            _script = _list[i];
            _uri = _script.src;
            if (_reg.test(_uri)) {
                var _arr = _uri.split(/[?#]/);
                var _site = __config.site, _obj = _helper.str2obj(_arr[1]);
                for (var x in _obj) {
                    _site[x] = _obj[x];
                }
            } else {
                _doScriptLoaded(_script);
            }
        }
        if (!_g.define) {
            _g.define = define;
        }
    };
    /*
     * 格式化地址,取绝对路径
     * @param  {String} _uri 待格式化地址
     * @return {String}      格式化后地址
     */
    var _doFormatURI = (function () {
        var _xxx = !1,
            _reg1 = /([^:])\/+/g,
            _reg2 = /[^\/]*$/,
            _reg3 = /\.js$/i,
            _anchor = _d.createElement('a');
        var _absolute = function (_uri) {
            return _uri.indexOf('://') > 0;
        };
        var _append = function () {
            if (_xxx) return;
            _xxx = !0;
            _anchor.style.display = 'none';
            document.body.appendChild(_anchor);
        };
        var _root = function (_uri) {
            return _uri.replace(_reg2, '');
        };
        var _format = function (_uri) {
            _append();
            var _arr = _uri.split('!'),
                _site = '',
                _path = _uri,
                _sufx = _reg3.test(_uri) ? '' : '.js';
            if (_arr.length > 1) {
                _site = __config.site[_arr.shift()];
                _path = _arr.join('!');
            }
            _uri = (_site + _path + _sufx).replace(_reg1, '$1/');
            _anchor.href = _uri;
            _uri = _anchor.href;
            return _absolute(_uri) && _uri.indexOf('./') < 0 ? _uri : _anchor.getAttribute('href', 4); // ie6/7
        };
        return function (_uri, _base, _type) {
            if (_helper.isTypeOf(_uri, 'Array')) {
                var _list = [];
                for (var i = 0; i < _uri.length; i++) {
                    _list.push(
                        _doFormatURI(_uri[i], _base, _type)
                    );
                }
                return _list;
            }
            if (!_uri) return '';
            if (_absolute(_uri)) {
                return _format(_uri);
            }
            if (_base && _uri.indexOf('.') == 0) {
                _uri = _root(_base) + _uri;
            }
            return _format(_uri);
        };
    })();
    /*
     * 侦测脚本载入情况
     * @param  {Node} _script 脚本节点
     * @return {Void}
     */
    var _doAddListener = (function () {
        var _statechange = function (_event) {
            var _element = _helper.getTarget(_event) || this;
            if (!_element) return;
            var _state = _element.readyState;
            if (_state === 'loaded' || _state === 'complete') _doScriptLoaded(_element, !0);
        };
        return function (_script) {
            _script.onload = function (e) {
                _doScriptLoaded(_helper.getTarget(e));
            };
            _script.onreadystatechange = _statechange;
        };
    })();
    /*
     * 页面已存在的script节点添加事件检测
     * @return {Void}
     */
    var _doAddAllListener = function () {
        var _list = document.getElementsByTagName('script');
        for (var i = _list.length - 1; i >= 0; i--) {
            _doAddListener(_list[i]);
        }
    };
    /*
     * 载入依赖脚本
     * @param  {String} _uri 脚本地址
     * @return {Void}
     */
    var _doLoadScript = function (_uri) {
        if (!_uri) return;
        var _state = __scache[_uri];
        if (_state != null) return;
        // load file
        __scache[_uri] = 0;
        var _script = _d.createElement('script');
        _script.type = 'text/javascript';
        _script.charset = 'utf-8';
        _doAddListener(_script);
        _script.src = _uri;
        (_d.getElementsByTagName('head')[0] || document.body).appendChild(_script);
    };
    /*
     * 脚本载入完成回调
     * @param  {Node}    _script 脚本节点对象
     * @param  {Boolean} _isok   脚本载入是否成功
     * @return {Void}
     */
    var _doScriptLoaded = function (_script) {
        var _uri = _doFormatURI(_script.src);
        if (!_uri) return;
        var _arr = __stack.pop();

        if (!!_arr) {
            _arr.unshift(_uri);
            _doDefine.apply(_g, _arr);
        }
        // change state
        if (!!_uri && __scache[_uri] != 1) {
            __scache[_uri] = 2;
        }
        _doClearScript(_script);
        _doCheckLoading();
    };
    /*
     * 检查依赖载入情况
     * @return {Void}
     */
    var _doCheckLoading = function () {
        if (!__xqueue.length) return;
        for (var i = __xqueue.length - 1, _item; i >= 0;) {
            _item = __xqueue[i];
            if (__scache[_item.n] !== 2 && (!_isMapLoaded(_item.p) || !_isListLoaded(_item.h) || !_isListLoaded(_item.d))) {
                i--;
                continue;
            }
            // for loaded
            __xqueue.splice(i, 1);
            if (__scache[_item.n] !== 2) {
                _doExecFunction(_item);
            }
            i = __xqueue.length - 1;
        }
        // check circular reference
        if (__xqueue.length > 0 && _isFinishLoaded()) {
            var _item = __xqueue.pop();
            _doExecFunction(_item);
            _doCheckLoading();
        }
    };
    /*
     * 检查列表是否都载入完成
     * @param  {Array} 列表
     * @return {Void}
     */
    var _isListLoaded = function (_list) {
        if (!!_list && !!_list.length) {
            for (var i = _list.length - 1; i >= 0; i--) {
                if (__scache[_list[i]] !== 2) {
                    return !1;
                }
            }
        }
        return !0;
    };
    /*
     * 检查集合是否都载入完成
     * @param  {Object} 集合
     * @return {Void}
     */
    var _isMapLoaded = function (_map) {
        if (!!_map) {
            for (var x in _map) {
                if (__scache[_map[x]] !== 2) {
                    return !1;
                }
            }
        }
        return !0;
    };
    /*
     * 检查所有文件是否都载入
     * @return {Boolean} 是否都载入
     */
    var _isFinishLoaded = function () {
        for (var x in __scache)
            if (__scache[x] === 0)
                return !1;
        return !0;
    };
    /*
     * 清理脚本节点
     * @param  {Node} _script 脚本节点
     * @return {Void}
     */
    var _doClearScript = function (_script) {
        if (!_script || !_script.parentNode) return;
        _script.onload = null;
        _script.onerror = null;
        _script.onreadystatechange = null;
        _script.parentNode.removeChild(_script);
    };
    /*
     * 执行文件脚本
     * @param  {Object} 缓存信息
     * @return {Void}
     */
    var _doExecFunction = (function () {
        // dependency inject param
        var _o = {},
            _r = [],
            _f = function () {
                return !1;
            };
        // merge inject param
        var _doMergeDI = function (_dep, _map) {
            var _arr = [];
            _map = _map || {}
            if (!!_dep) {
                // merge dependency list result
                for (var i = 0, l = _dep.length, _it; i < l; i++) {
                    _it = _dep[i];
                    if (!__rcache[_it] && !_map[_it]) {
                        __rcache[_it] = {};
                    }
                    // result of (platform.js || platform.patch.js)
                    _arr.push(__rcache[_it] || __rcache[_map[_it]] || {});
                }
            }
            _arr.push({}, _o, _f, _r);
            return _arr;
        };
        var _doMergeResult = function (_uri, _result) {
            var _ret = __rcache[_uri],
                _iso = {}.toString.call(_result) == '[object Object]';
            if (!!_result) {
                if (!_ret || !_iso) {
                    // for other type of return
                    _ret = _result;
                } else {
                    // for namespace return
                    _ret = _ret || {};
                    for (var x in _result) {
                        _ret[x] = _result[x];
                    }
                }
            }
            __rcache[_uri] = _ret;
        };
        return function (_item) {
            var _args = _doMergeDI(
                _item.d, _item.p
            );
            if (!!_item.f) {
                var _result = _item.f.apply(_g, _args) ||
                    _args[_args.length - 4];
                _doMergeResult(_item.n, _result);
            }
            __scache[_item.n] = 2;
        };
    })();
    /*
     * 格式化输入参数
     * @param  {String}   字符串
     * @param  {Array}    数组
     * @param  {Function} 函数
     * @return {Array}    格式化后的参数列表
     */
    var _doFormatARG = function (_str, _arr, _fun) {
        var _args = [null, null, null],
            _kfun = [
                function (_arg) {
                    return _helper.isTypeOf(_arg, 'String');
                },
                function (_arg) {
                    return _helper.isTypeOf(_arg, 'Array');
                },
                function (_arg) {
                    return _helper.isTypeOf(_arg, 'Function');
                }
            ];
        for (var i = 0, l = arguments.length, _it; i < l; i++) {
            _it = arguments[i];
            for (var j = 0, k = _kfun.length; j < k; j++) {
                if (_kfun[j](_it)) {
                    _args[j] = _it;
                    break;
                }
            }
        }
        return _args;
    };
    /*
     * 执行模块定义
     * @param  {String}   _uri      当前所在文件，确定文件中模块不会被其他文件依赖时可以不用传此参数，比如入口文件
     * @param  {Array}    _deps     模块依赖的其他模块文件，没有依赖其他文件可不传此参数
     * @param  {Function} _callback 模块定义回调【必须】
     * @return {Void}
     */
    var _doDefine = (function () {
        var _seed = +new Date,
            _keys = ['d', 'h'];
        var _doComplete = function (_list, _base) {
            if (!_list || !_list.length) return;
            for (var i = 0, l = _list.length, _it; i < l; i++) {
                _it = _list[i] || '';
                if (_it.indexOf('.') != 0) continue;
                _list[i] = _doFormatURI(_it, _base);
            }
        };
        return function (_uri, _deps, _callback) {
            // check input
            var _args = _doFormatARG.apply(
                _g, arguments
            );
            _uri = _args[0] ||
            _doFormatURI('./' + (_seed++) + '.js');
            _deps = _args[1];
            _callback = _args[2];
            // check module defined in file
            _uri = _doFormatURI(_uri);
            if (__scache[_uri] === 2) {
                return; // duplication
            }
            var _pths;
            // complete relative uri
            _doComplete(_deps, _uri);
            __scache[_uri] = 1;
            // push to load queue
            var _xmap = {
                n: _uri, d: _deps,
                h: _pths, f: _callback
            };
            __xqueue.push(_xmap);
            // load dependence
            for (var i = 0, l = _keys.length, _it, _list; i < l; i++) {
                _it = _keys[i];
                _list = _xmap[_it];
                if (!!_list && !!_list.length) {
                    var _kmap = {};
                    for (var k = 0, j = _list.length, _itt, _itm, _arr, _type; k < j; k++) {
                        _itt = _list[k];
                        if (!_itt) {
                            console.warn('empty dep uri for ' + _uri);
                        }
                        // 0 - url
                        // 1 - load function
                        // 2 - resource type
                        _itm = _doFormatURI(_itt);
                        _kmap[_itt] = _itm;
                        _list[k] = _itm;
                        _doLoadScript(_itm);
                    }
                    if (_it === 'h' && !!_xmap.f) {
                        _xmap.f.kmap = _kmap;
                    }
                }
            }
            // check state
            _doCheckLoading();
        };
    })();

    var define = function (_uri, _deps, _callback) {
        var _args = [].slice.call(arguments, 0);
        __stack.push(_args);
        _doAddAllListener();
    };

    _doInit();
})(document, window);