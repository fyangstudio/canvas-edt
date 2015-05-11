define([
    '$text!./side.html',
    'lib!templates/tpl',
], function (tpl, $tpl, $p, $f, $w) {
    var _data = {
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

    $tpl({
        template: tpl,
        $init: function () {
            this.data = _data;
        },
        test: function () {

        }
    }).$inject('#test')

});