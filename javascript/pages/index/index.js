define([
    'lib!/util/klass',
    'pro!../widget/module',
    '6<=$ie<=9!./hack/below-ie9',
    'lib!canvas/framework',
    './side'
], function (k, m, ie, fw, sd, _p) {

    _p._$$Module = k._$klass();
    var _pro = _p._$$Module._$extend(m._$$Module);
    _pro.__init = function () {
        // 调用_$$Module的初始化逻辑
        this.__super();
        console.log('child class');
    };
    console.log(ie);
    console.log(fw);
    console.log(window.test);
    _pro.__init();
});