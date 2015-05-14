function test() {
    (function (_data, _helper
               /**/) {
        "use strict";
        var _tpl = {};
        var _out = "";
        var _event = [];
        try {
            var _eventCount = 0;
            var books = _data.books || "";
            var orders = _data.orders || "";
            var book = _data.book || "";
            var info = _data.info || "";
            var books = _data.books || "";
            var book = _data.book || "";
            var book = _data.book || "";
            var n = _data.n || "";
            var orders = _data.orders || "";
            var order = _data.order || "";
            var order = _data.order || "";
            var order = _data.order || "";
            _out += "<div class='side' id='test2'>";
            if (!!info) {
                _out += "<p>你好，";
                _out += info.name;
                _out += "！</p>";
                if (!!info.vip) {
                    _out += "";
                    if (info.level < 5) {
                        _out += "<p>普通会员</p>";
                    } else if (info.level >= 5 && info.level < 8) {
                        _out += "<p>中级会员</p>";
                    } else {
                        _out += "<p>高级会员</p>";
                    }
                    _out += "";
                } else {
                    _out += "<p>普通用户</p>";
                }
                _out += "<h3>阅读历史：";
                _out += books.length;
                _out += "</h3>";
                ~function () {
                    var i1 = 0;
                    for (var key0 in books) {
                        if (books.hasOwnProperty(key0)) {
                            var _i = i1++;
                            var _v = books[key0];
                            var book = typeof( _v ) === "object" ? _v : [_v];
                            book._index = _i;
                            _out += "";
                            if (book.read) {
                                _out += "<p ";
                                _out += "tpl_event=" + (_eventCount++);
                                _event.push({E: "click", F: "this.test(tpl_P[0],'sss',1)", P: [book.id]});
                                _out += ">";
                                _out += book.name;
                                _out += "：已读</p>";
                            } else {
                                _out += "<p>";
                                _out += book.name;
                                _out += "：未读</p>";
                            }
                            _out += "";
                            if (!!book.note) {
                                _out += "";
                                ~function () {
                                    var i2 = 0;
                                    for (var key1 in book.note) {
                                        if (book.note.hasOwnProperty(key1)) {
                                            var _i = i2++;
                                            var _v = book.note[key1];
                                            var n = typeof( _v ) === "object" ? _v : [_v];
                                            n._index = _i;
                                            _out += "";
                                            if (n._index < 2) {
                                                _out += "";
                                                _out += n;
                                                _out += "";
                                            } else {
                                                _out += "更多 >>";
                                            }
                                            _out += "";
                                        }
                                    }
                                }();
                                _out += "";
                            }
                            _out += "";
                        }
                    }
                }();
                _out += "<h3>购买信息：";
                _out += orders.length;
                _out += "</h3><table border='1'>";
                ~function () {
                    var i3 = 0;
                    for (var key2 in orders) {
                        if (orders.hasOwnProperty(key2)) {
                            var _i = i3++;
                            var _v = orders[key2];
                            var order = typeof( _v ) === "object" ? _v : [_v];
                            order._index = _i;
                            _out += "<tr><td>";
                            _out += order.id;
                            _out += "</td><td>";
                            _out += order.goods;
                            _out += "</td><td>";
                            _out += order.state.replace('发货', '出库');
                            _out += "</td></tr>";
                        }
                    }
                }();
                _out += "</table>";
            } else {
                _out += "<p>欢迎你，新游客！ </p>";
            }
            _out += "</div>";
            _out = _helper.$parseHTML(_out);
            var _fragment = document.createDocumentFragment();
            _fragment.appendChild(_out);
            var _cnt = _fragment.childNodes[0];
            if (!!_cnt) {
                var _list = _cnt.getElementsByTagName("*");
                for (var i = 0, n = _list.length; i < n; i++) {
                    var _n = _list[i];
                    var _tmp = _n.getAttribute("tpl_event");
                    if (_tmp) {
                        var _o = _event[_tmp];
                        var _eventFn = function ($event) {
                            var _f = new Function("$event, tpl_P", _o.F);
                            _f.call(this, $event, _o.P);
                        }
                        _helper.$addEvent(_n, _o.E, _eventFn($event).bind(this));
                    }
                }
            }
            return _fragment;
        } catch (e) {
            throw new Error("$tpl: " + e.message);
        }
    })
}