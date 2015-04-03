define([
    'lib!/util/klass'
], function (k, $p, $f, $w) {

    var _pro;
    // 定义类基类_$$Module
    $p._$$Module = k._$klass();
    _pro = $p._$$Module.prototype;
    // 初始化
    _pro.__init = function () {
        console.log('base class!');
    };

    return $p;
});