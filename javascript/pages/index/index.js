define([
    'lib!/util/klass',
    'pro!../widget/module',
    '6<=$ie<=9!./hack/below-ie9',
    'lib!canvas/framework',
    './side'
], function (k, m, ie, fw, sd, $p, $f, $w) {

    var _pro;

    $p._$$Module = k._$klass();
    _pro = $p._$$Module._$extend(m._$$Module);
    _pro.__init = function () {
        // 调用_$$Module的初始化逻辑
        this.__super();
        console.log('child class');
    };
    console.log($w)
    console.log(ie);
    console.log(fw);
    _pro.__init();

    return $p;
});