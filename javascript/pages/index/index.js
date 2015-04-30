define([
    'lib!/util/klass',
    'pro!../widget/module',
    '6<=$ie<=9!./hack/below-ie9',
    'lib!canvas/framework',
    'lib!templates/tpl',
    './side'
], function (k, m, ie, fw, tpl, sd, $p, $f, $w) {

    var _pro;

    var data = {
        info: {
            name: 'Yangfan',
            vip: true,
            level: 10,
            area: 'Hangzhou'
        },
        books: [
            {name: 'JavaScript高级程序设计', read: true, note: [' 笔记 ', ' 笔记笔记 ', ' 笔记笔记笔记 ']},
            {name: 'Node.js实战', read: true, note: [' 笔记 ', ' 笔记笔记 ']},
            {name: 'Java程序设计', read: false}
        ],
        orders: [
            {id: '1001', goods: "book1", state: "未发货"},
            {id: '1002', goods: "book2", state: "已发货"}
        ]
    };

    var __tpl = document.getElementById('tpl1').innerHTML


    $p._$$Module = k._$klass();
    _pro = $p._$$Module._$extend(m._$$Module);
    _pro.__init = function () {
        // 调用_$$Module的初始化逻辑
        this.__super();
        console.log('child class');
        console.log(tpl(__tpl, data));
        data.info.name = 'Jason';
    };
    //console.log($w)
    //console.log(ie);
    //console.log(fw);
    _pro.__init();

    return $p;
});