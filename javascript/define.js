(function (_d, _g) {

    var __config = {root: {/*lib,pro,platform*/lib: 'javascript/lib'}/*native,charset,global,platform*/};
    /*
     * 判断是否字符串
     * @param  {Varable} _data 数据
     * @param  {String}  _type 类型
     * @return {Boolean}       是否字符串
     */
    var _isTypeOf = function (_data, _type) {
        return Object.prototype.toString.call(_data) === '[object ' + _type + ']';
    };
    /*
     * 格式化地址,取绝对路径
     * @param  {String} _uri 待格式化地址
     * @return {String}      格式化后地址
     */
    var _doFormatURI = (function () {
        var _xxx = !1,
            _reg = /{(.*?)}/gi,
            _reg1 = /([^:])\/+/g,
            _reg3 = /[^\/]*$/,
            _reg4 = /\.js$/i,
            _reg5 = /^[{\/\.]/,
            _anchor = _d.createElement('a');
        var _absolute = function (_uri) {
            return _uri.indexOf('://') > 0;
        };
        var _slash = function (_uri) {
            return _uri.replace(_reg1, '$1/');
        };
        var _append = function () {
            if (_xxx) return;
            _xxx = !0;
            _anchor.style.display = 'none';
            document.body.appendChild(_anchor);
        };
        var _root = function (_uri) {
            return _uri.replace(_reg3, '');
        };
        var _format = function (_uri) {
            _append();
            _anchor.href = _uri;
            _uri = _anchor.href;
            return _absolute(_uri) && _uri.indexOf('./') < 0 ?
                _uri : _anchor.getAttribute('href', 4); // ie6/7
        };
        var _amdpath = function (_uri, _type) {
            // start with {xx} or /xx/xx or ./ or ../
            // end with .js
            // absolute uri
            if (_reg4.test(_uri) ||
                _reg5.test(_uri) ||
                _absolute(_uri)) {
                return _uri;
            }
            // lib/base/klass -> {lib}base/klass.js
            // pro/util/a     -> {pro}util/a.js
            var _arr = _uri.split('/'),
                _path = __config.root[_arr[0]],
                _sufx = !_type ? '.js' : _type;
            if (!!_path) {
                _arr.shift();
                return _path + _arr.join('/') + _sufx;
            }
            // for base/klass -> {lib}base/klass.js
            return '{lib}' + _arr.join('/') + _sufx;
        };
        return function (_uri, _base, _type) {
            if (_isTypeOf(_uri, 'Array')) {
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
            _uri = _slash(_amdpath(_uri, _type));
            var _uri = _uri.replace(
                _reg, function ($1, $2) {
                    return __config.root[$2] || $2;
                }
            );
            return _format(_uri);
        };
    })();

    console.log(_doFormatURI(['{lib}/framework.js'], true))

})(document, window);