define([
    './global.js',
], function (_g, _p) {
    _p.__forIn = function (_obj, _callback, _this) {
        if (!_obj || !_callback) {
            return null;
        }
        var _keys = Object.keys(_obj);
        for (var i = 0, l = _keys.length, _key, _ret; i < l; i++) {
            _key = _keys[i];
            _ret = _callback.call(
                _this || null,
                _obj[_key], _key, _obj
            );
            if (!!_ret) {
                return _key;
            }
        }
        return null;
    };
    return _p;
})