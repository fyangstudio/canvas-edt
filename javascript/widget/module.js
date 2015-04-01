define([
    'lib!/util/klass'
], function (k) {
    // 定义类基类_$$Module
    var p = {};
    p._$$Module = k._$klass();
    var pro = p._$$Module.prototype;
    // 初始化
    pro.__init = function () {
        console.log('base class!');
    };

    return p;
});