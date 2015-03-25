(function (_d, _g) {

    var __config = {site: {/*lib,pro,platform*/lib: 'javascript/lib/'}/*native,charset,global,platform*/};
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
        var _init = !1,
            _reg1 = /([^:])\/+/g,
            _reg4 = /\.js$/i,
            _reg5 = /^[\/\.]/,
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
                _sufx = _reg4.test(_uri) ? '' : '.js';
            return (_site + _arr[0] + _sufx).replace(_reg1, '$1/');
        };
        return function (_uri) {
            if (_isTypeOf(_uri, 'Array')) {
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

    console.log(_doFormatURI('lib!./framework'))

})(document, window);