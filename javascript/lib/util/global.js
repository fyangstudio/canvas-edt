define(function (_p) {
    var _f = function () {
    };
    var _extpro = Function.prototype;
    /**
     * AOP增强操作，增强操作接受一个输入参数包含以下信息
     *
     *  | 参数名称 | 参数类型  | 参数描述 |
     *  | :--     | :--      | :-- |
     *  | args    | Array    | 函数调用时实际输入参数，各增强操作中可以改变值后将影响至后续的操作 |
     *  | value   | Variable | 输出结果 |
     *  | stopped | Boolean  | 是否结束操作，终止后续操作 |
     *
     * @method external:Function#_$aop
     * @param  {Function} arg0 - 前置操作，接受一个输入参数，见描述信息
     * @param  {Function} arg1 - 后置操作，接受一个输入参数，见描述信息
     * @return {Function}        增强后操作函数
     */
    _extpro._$aop = function (_before, _after) {
        var _after = _after || _f,
            _before = _before || _f,
            _handler = this;
        return function () {
            var _event = {args: _r.slice.call(arguments, 0)};
            _before(_event);
            if (!_event.stopped) {
                _event.value = _handler.apply(this, _event.args);
                _after(_event);
            }
            return _event.value;
        };
    };
    /**
     * 绑定接口及参数，使其的调用对象保持一致
     *
     *  ```javascript
     *  var scope = {a:0};
     *
     *  var func = function(a,b){
     *      // 第一个参数 ：1
     *      console.log(a);
     *      // 第二个参数 ： 2
     *      consoel.log(b);
     *      // 当前this.a ： 0
     *      console.log(this.a);
     *  };
     *
     *  func._$bind(scope,"1")(2);
     *  ```
     *
     * @method external:Function#_$bind
     * @see    external:Function#_$bind2
     * @param  {Object} arg0 - 需要保持一致的对象，null表示window对象，此参数外的其他参数作为绑定参数
     * @return {Function}      返回绑定后的函数
     */
    _extpro._$bind = function () {
        var _args = arguments,
            _object = arguments[0],
            _function = this;
        return function () {
            // not use slice for chrome 10 beta and Array.apply for android
            var _argc = _r.slice.call(_args, 1);
            _r.push.apply(_argc, arguments);
            return _function.apply(_object || null, _argc);
        };
    };
    // for compatiable
    var _extpro = String.prototype;
    if (!_extpro.trim) {
        _extpro.trim = (function () {
            var _reg = /(?:^\s+)|(?:\s+$)/g;
            return function () {
                return this.replace(_reg, '');
            };
        })();
    }
    if (!this.console) {
        this.console = {
            log: _f,
            error: _f
        };
    }

    return _p;
});
