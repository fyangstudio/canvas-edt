(function (_d, _g) {

    // 配置载入方法
    var __config = {site: {}}, __stack = []; // for define stack

    // 工具函数
    var _helper = {
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
        // do init add loaded script and remove node
        var _list = _d.getElementsByTagName('script');
        if (!_list || !_list.length) return;
        var _reg = /\/define\.js(?=\?|#|$)/;
        for (var i = _list.length - 1, _script, _uri; i >= 0; i--) {
            _script = _list[i];
            _script.get = !0;
            _uri = _script.src;
            if (_reg.test(_uri)) {
                var _arr = _uri.split(/[?#]/);
                var _site = __config.site, _obj = _helper.str2obj(_arr[1]);
                for (var x in _obj) {
                    _site[x] = _obj[x];
                }
            } else {
                //todo
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
        var _init = !1,
            _reg1 = /([^:])\/+/g,
            _reg2 = /\.js$/i,
            _anchor = _d.createElement('a'),
            _classMap = {
                text: function (_uri) {
                    // todo
                },
                json: function (_uri) {
                    // todo
                }
            },
            _browerMap = ['webkit', 'ie', 'firefox'];
        var _absolute = function (_uri) {
            return _uri.indexOf('://') > 0;
        };
        var _append = function () {
            if (_init) return;
            _init = !0;
            _anchor.style.display = 'none';
            document.body.appendChild(_anchor);
        };
        var _parse = function (_uri) {
            var _brr = [],
                _type = null,
                _arr = _uri.split('!'),
                _fun = _classMap[_arr[0].toLowerCase()];
            if (_arr.length > 1) {
                _type = _arr.shift();
            }
            _brr.push(_arr.join('!'));
            _brr.push(_fun || 'todo');
            _brr.push(_type);
            return _brr;
        };
        var _format = function (_uri) {
            _append();
            _anchor.href = _uri;
            _uri = _anchor.href;
            return _absolute(_uri) && _uri.indexOf('./') < 0 ? _uri : _anchor.getAttribute('href', 4); // ie6/7
        };
        var _amdPath = function (_uri) {
            var _arr = _parse(_uri),
                _site = __config.site[_arr[2]] || '',
                _sufx = _reg2.test(_uri) ? '' : '.js';
            return (_site + _arr[0] + _sufx).replace(_reg1, '$1/');
        };
        return function (_uri) {
            if (_helper.isTypeOf(_uri, 'Array')) {
                var _list = [];
                for (var i = 0; i < _uri.length; i++) {
                    _list.push(
                        _doFormatURI(_uri[i])
                    );
                }
                return _list;
            }
            if (!_uri) return '';
            if (_absolute(_uri)) {
                return _format(_uri);
            }
            return _format(_amdPath(_uri));
        };
    })();

    var define = function (_uri, _deps, _callback) {
        var _args = [].slice.call(arguments, 0);

        __stack.push(_args);
        console.log(__stack[0])
    };

    // 入口方法
    _doInit();
    console.log(_doFormatURI('lib!./canvas/framework'))

})(document, window);