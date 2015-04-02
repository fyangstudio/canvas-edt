define([
    './util.js',
], function (_u, _p) {
    _f = function () {
    };

    _p._$klass = (function () {
        var _isNotFunction = function () {
            return {}.toString.call(arguments[0]) !== '[object Function]';
        };
        var _doFindIn = function (_method, _klass) {
            while (!!_klass) {
                var _pro = _klass.prototype,
                    _key = _u.__forIn(_pro, function (v) {
                        return _method === v;
                    });
                if (_key != null) {
                    return {
                        name: _key,
                        klass: _klass
                    };
                }
                _klass = _klass._$super;
            }
        };
        return function () {
            // class constructor
            var _Klass = function () {
                return this.__init.apply(this, arguments);
            };
            _Klass.prototype.__init = _f;
            _Klass._$extend = function (_super, _static) {
                if (_isNotFunction(_super)) {
                    return;
                }
                // for static method
                var _this = this;
                if (_static !== !1) {
                    _u.__forIn(_super, function (v, k) {
                        if (!_isNotFunction(v)) {
                            _this[k] = v;
                        }
                    });
                }
                // do inherit
                this._$super = _super;
                var _parent = function () {
                };
                _parent.prototype = _super.prototype;
                this.prototype = new _parent();
                this.prototype.constructor = this;
                // for super method call
                var _stack = [],
                    _phash = {};
                var _doUpdateCache = function (_method, _klass) {
                    var _result = _doFindIn(_method, _klass);
                    if (!_result) return;
                    // save state
                    if (_stack[_stack.length - 1] != _result.name) {
                        _stack.push(_result.name);
                    }
                    _phash[_result.name] = _result.klass._$super;
                    return _result.name;
                };
                this.prototype.__super = function () {
                    var _name = _stack[_stack.length - 1],
                        _method = arguments.callee.caller;
                    if (!_name) {
                        _name = _doUpdateCache(_method, this.constructor);
                    } else {
                        var _parent = _phash[_name].prototype;
                        // switch caller name
                        if (!_parent.hasOwnProperty(_method) ||
                            _method != _parent[_name]) {
                            _name = _doUpdateCache(_method, this.constructor);
                        } else {
                            _phash[_name] = _phash[_name]._$super;
                        }
                    }
                    // call parent method
                    var _ret = _phash[_name].prototype[_name].apply(this, arguments);
                    // exit super
                    if (_name == _stack[_stack.length - 1]) {
                        _stack.pop();
                        delete _phash[_name];
                    }
                    return _ret;
                };

                return this.prototype;
            };
            return _Klass;
        };
    })();

    return _p;
});
