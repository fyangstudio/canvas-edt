(function (_d, _g) {

    var __sys = {}, // browser info
        __noop = function () {
        }, // do nothing
        __ua = navigator.userAgent.toLowerCase(), // userAgent
        __config = {site: {}, charset: 'utf-8'}, // quick site config
        __xqueue = [], // item:{n:'filename',d:[/* dependency list */],p:[/* platform list */],h:[/* patch list */],f:function}
        __scache = {}, // state cache   0-loading  1-waiting  2-defined
        __rcache = {}, // result cache
        __stack = []; // for define stack

    // 解析浏览器信息
    if (__ua.indexOf('chrome') > 0) __sys.$chrome = __ua.match(/chrome\/([\d.]+)/)[1];
    else if (window.ActiveXObject) __sys.$ie = __ua.match(/msie ([\d.]+)/)[1];
    else if (document.getBoxObjectFor) __sys.$firefox = __ua.match(/firefox\/([\d.]+)/)[1];
    else if (window.openDatabase) __sys.$safari = __ua.match(/version\/([\d.]+)/)[1];
    else if (window.opera) __sys.$opera = __ua.match(/opera.([\d.]+)/)[1];

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
            _script.xxx = !0;
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
     * 解析插件信息
     * @param  {String} _uri 地址
     * @return {Array}       插件信息
     */
    var _doParsePlugin = (function () {
        var _pmap = {
            $text: function (_uri) {
                _doLoadText(_uri);
            },
            $json: function (_uri) {
                // todo
            }
        };
        var _doParseVersion = function (_exp, _sys) {
            _exp = (_exp || '').replace(/\s/g, '').replace(_sys, 'PT');
            var _arr = _exp.split('PT'),
                _reg = /([<>=]=?)/,
                _left = "'" + _arr[0].replace(_reg, "'$1'") + "[VERSION]'",
                _right = "'[VERSION]" + _arr[1].replace(_reg, "'$1'") + "'";
            return (function () {
                var _res = ['true'], _ver = parseInt(__sys[_sys]);
                if (!!_left) _res.push(_left.replace('[VERSION]', _ver));
                if (!!_right) _res.push(_right.replace('[VERSION]', _ver));
                return eval(_res.join('&&'));
            })();
        };
        return function (_uri) {
            var _brr = [],
                _type = null,
                _arr = _uri.split('!'),
                _target = _arr[0],
                _reg = /\$[^><=!]+/,
                _fun = _pmap[_target.toLowerCase()];
            if (_arr.length > 1 && !__config.site[_target]) {
                var _temp = _arr.shift(),
                    _sys = _target.match(_reg)[0];
                if (__sys[_sys] && _doParseVersion(_target, _sys)) _fun = '';
                else if (!_fun) _fun = __noop;
                _type = _fun ? _temp : null;
            }
            _brr.push(_arr.join('!'));
            _brr.push(_fun || _doLoadScript);
            _brr.push(_type);
            return _brr;
        };
    })();
    /*
     * 格式化地址,取绝对路径
     * @param  {String} _uri 待格式化地址
     * @return {String}      格式化后地址
     */
    var _doFormatURI = (function () {
        var _addA = !1,
            _reg1 = /([^:])\/+/g,
            _reg2 = /[^\/]*$/,
            _reg3 = /\.js$/i,
            _anchor = _d.createElement('a');
        var _absolute = function (_uri) {
            return _uri.indexOf('://') > 0;
        };
        var _append = function () {
            if (_addA) return;
            _addA = !0;
            _anchor.style.display = 'none';
            document.body.appendChild(_anchor);
        };
        var _root = function (_uri) {
            return _uri.replace(_reg2, '');
        };
        var _format = function (_uri, _type) {
            _append();
            var _arr = _uri.split('!'),
                _site = '',
                _path = _uri,
                _sufx = (_type || _reg3.test(_uri)  ) ? '' : '.js';
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
            if (!_uri) return '';
            if (_helper.isTypeOf(_uri, 'Array')) {
                var _list = [];
                for (var i = 0; i < _uri.length; i++) {
                    _list.push(
                        _doFormatURI(_uri[i], _base, _type)
                    );
                }
                return _list;
            }
            if (_absolute(_uri)) {
                return _format(_uri, _type);
            }
            if (_base && _uri.indexOf('.') == 0) {
                _uri = _root(_base) + _uri;
            }
            return _format(_uri, _type);
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
        for (var i = _list.length - 1, _script; i >= 0; i--) {
            _script = _list[i];
            if (!_script.xxx) {
                _script.xxx = !0;
                !_script.src ? _doClearStack()
                    : _doAddListener(_list[i]);
            }
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
        _script.xxx = !0;
        _script.type = 'text/javascript';
        _script.charset = __config.charset;
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

        _doCheckLoading();
        _doClearScript(_script);

    };
    /*
     * 载入依赖文本
     * @param  {String} _uri 文本地址
     * @return {Void}
     */
    var _doLoadText = (function () {
        var _msid,
            _msxml = [
                'Msxml2.XMLHTTP.6.0',
                'Msxml2.XMLHTTP.3.0',
                'Msxml2.XMLHTTP.4.0',
                'Msxml2.XMLHTTP.5.0',
                'MSXML2.XMLHTTP',
                'Microsoft.XMLHTTP'
            ];
        var _getXHR = function () {
            if (!!_g.XMLHttpRequest) {
                return new _g.XMLHttpRequest();
            }
            if (!!_msid) {
                return new ActiveXObject(_msid);
            }
            for (var i = 0, l = _msxml.length, _it; i < l; i++) {
                try {
                    _it = _msxml[i];
                    var _xhr = new ActiveXObject(_it);
                    _msid = _it;
                    return _xhr;
                } catch (e) {
                    // ignore
                }
            }
        };
        return function (_uri, _callback) {
            if (!_uri) return;
            var _state = __scache[_uri];
            if (_state != null) return;
            // load text
            __scache[_uri] = 0;
            var _xhr = _getXHR();
            _xhr.onreadystatechange = function () {
                if (_xhr.readyState == 4) {
                    var _text = _xhr.responseText || '';
                    __scache[_uri] = 2;
                    __rcache[_uri] = _text;
                    if (!!_callback) {
                        _callback(_text);
                    }
                    _doCheckLoading();
                }
            };
            _xhr.open('GET', _uri, !0);
            _xhr.send(null);
        };
    })();
    /*
     * 搜索循环引用
     * @return {Object} 需解环项
     */
    var _doFindCircularRef = (function () {
        var _result;
        var _index = function (_array, _name) {
            for (var i = _array.length - 1; i >= 0; i--)
                if (_array[i].n == _name)
                    return i;
            return -1;
        };
        var _loop = function (_item) {
            if (!_item) return;
            var i = _index(_result, _item.n);
            if (i >= 0) return _item;
            _result.push(_item);
            var _deps = _item.d;
            if (!_deps || !_deps.length) return;
            for (var i = 0, l = _deps.length, _citm; i < l; i++) {
                _citm = _loop(__xqueue[_index(__xqueue, _deps[i])]);
                // blew ie9 check for depends resource loaded
                if (!!_citm) {
                    var _citmdes = _citm.d;
                    if (!!_citmdes && !!_citmdes.length) {
                        for (var j = _citmdes.length - 1; j >= 0; j--) {
                            if (__scache[_citmdes[i]] !== 2) {
                                return _citmdes[i];
                            }
                        }
                    }
                    return _citm;
                }
            }
        };
        var _exec = function (_list, _pmap) {
            if (!_pmap) return;
            // find platform patch list
            var _arr = [];
            for (var i = 0, l = _list.length, _it; i < l; i++) {
                _it = _list[i];
                if (_pmap[_it]) {
                    _arr.push(_it);
                }
            }
            // index queue by file name
            var _map = {};
            for (var i = 0, l = __xqueue.length, _it; i < l; i++) {
                _it = __xqueue[i];
                _map[_it.n] = _it;
            }
            // execute platform patch
            for (var i = 0, l = _arr.length, _it, _item; i < l; i++) {
                _it = _arr[i];
                // exec hack.js
                _item = _map[_it];
                if (!!_item) {
                    _doExecFunction(_item);
                    console.log("!!!" + _item.n)
                }
                // exec hack.patch.js
                _item = _map[_pmap[_it]];
                if (!!_item) {
                    _doExecFunction(_item);
                }
            }
        };
        return function () {
            _result = [];
            // check from begin to end
            var _item = _loop(__xqueue[0]);
            // must do platform before excute
            if (!!_item) {
                _exec(_item.d, _item.p);
            }
            return _item;
        };
    })();
    /*
     * 检查依赖载入情况
     * @return {Void}
     */
    var _doCheckLoading = function () {
        if (!__xqueue.length) return;
        for (var i = __xqueue.length - 1, _item; i >= 0;) {
            _item = __xqueue[i];
            if (__scache[_item.n] !== 2 && !_isListLoaded(_item.d)) {
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
            var _item = _doFindCircularRef() || __xqueue.pop();
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
        var $w = _g,
            $f = __noop;
        // merge inject param
        var _doMergeDI = function (_dep) {
            var _arr = [];
            if (!!_dep) {
                // merge dependency list result
                for (var i = 0, l = _dep.length; i < l; i++) {
                    // result of
                    _arr.push(__rcache[_dep[i]] || {});
                }
            }
            _arr.push({}, $f, $w);
            return _arr;
        };
        var _doMergeResult = function (_uri, _result) {
            var _ret = __rcache[_uri],
                _iso = _helper.isTypeOf(_result, 'Object');
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
            var _args = _doMergeDI(_item.d);
            if (!!_item.f) {
                var _result = _item.f.apply(_g, _args) ||
                    _args[_args.length - 4];
                _doMergeResult(_item.n, _result);
            }
            __scache[_item.n] = 2;
            //console.log('do ' + _item.n);
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
        var _seed = +new Date;
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
            _uri = _args[0] || _doFormatURI('./' + (_seed++) + '.js');
            _deps = _args[1];
            _callback = _args[2];
            // check module defined in file
            _uri = _doFormatURI(_uri);
            if (__scache[_uri] === 2) {
                return; // duplication
            }
            // complete relative uri
            _doComplete(_deps, _uri);
            __scache[_uri] = 1;
            // push to load queue
            var _xmap = {
                n: _uri, d: _deps,
                f: _callback
            };
            __xqueue.push(_xmap);
            // load dependence
            var _list = _xmap.d;
            if (!!_list && !!_list.length) {
                for (var k = 0, j = _list.length, _itt, _itm, _arr; k < j; k++) {
                    _itt = _list[k];
                    if (!_itt) return;
                    // 0 - url
                    // 1 - load function
                    // 2 - resource type
                    _arr = _doParsePlugin(_itt);
                    _itm = _doFormatURI(_arr[0], _uri, _arr[2]);
                    _list[k] = _itm;
                    _arr[1](_itm);
                }

            }
            // check state
            _doCheckLoading();
        };
    })();
    /*
     * 查找当前执行的脚本 for ie
     * @return {Node} 当前执行脚本
     */
    var _doFindScriptRunning = function () {
        var _list = document.getElementsByTagName('script');
        for (var i = _list.length - 1, _script; i >= 0; i--) {
            _script = _list[i];
            if (_script.readyState == 'interactive')
                return _script;
        }
    };
    /*
     * 清理函数定义缓存栈
     * @return {Void}
     */
    var _doClearStack = function () {
        var _args = __stack.pop();
        while (!!_args) {
            _doDefine.apply(p, _args);
            _args = __stack.pop();
        }
    };
    var define = function (_uri, _deps, _callback) {
        var _args = [].slice.call(arguments, 0),
            _script = _doFindScriptRunning();
        // for ie check running script
        if (!!_script) {
            var _src = _script.src;
            if (!!_src) _args.unshift(_doFormatURI(_src));
            return _doDefine.apply(_g, _args);
        }
        __stack.push(_args);
        _doAddAllListener();
    };

    _doInit();
})(document, window);