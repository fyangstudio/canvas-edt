define([
    'lib!util/global',
    '$text!./side.html',
    'lib!templates/tpl',
], function (_g, tpl, $tpl, $p, $f, $w) {
    var _data = {
        info: {
            name: 'Yangfan',
            vip: true,
            level: 10,
            area: 'Hangzhou'
        },
        books: [
            {id: 1, name: 'JavaScript高级程序设计', read: true, note: [' 笔记 ', ' 笔记笔记 ', ' 笔记笔记笔记 ']},
            {id: 2, name: 'Node.js实战', read: true, note: [' 笔记 ', ' 笔记笔记 ']},
            {id: 3, name: 'Java程序设计', read: false}
        ],
        orders: [
            {id: '1001', goods: "book1", state: "未发货"},
            {id: '1002', goods: "book2", state: "已发货"}
        ]
    };

    var tpl = $tpl({
        template: tpl,
        $init: function () {
            this.data = _data;
        },
        test: function (_id) {
            console.log(_id);
            tpl.data.info.name = 'PP';
            tpl.$update();
        }
    }).$inject('#test');


    var t1 = {a: [1, 2, 3], b: {1: 1, 2: 2}, c: 1};
    var t2 = {a: [1, 2, 3], b: {1: 1, 2: 2}, c: 1};
    console.log(_g.$same(t1, t2, true));

    console.log(_g.$clone(document.getElementById('test'), true));

});