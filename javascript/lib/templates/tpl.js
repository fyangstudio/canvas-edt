define([
    'lib!util/global',
    'lib!/util/klass'
], function (_g, k, $p, $f, $w) {

    // 方法匹配
    var _settings = {
        listStart: /{{#list\s*([^}]*?)\s*as\s*(\w*?)\s*(,\s*\w*?)?}}/igm,
        listEnd: /{{\/list}}/igm,
        interpolate: /{{([\s\S]+?)}}/igm,
        eventReg: /on-(\w+)\s*=\s*{{([\s\S]+?)}}/igm,
        comment: /{{!([^}]*?)!}}/igm,
        ifStart: /{{#if\s*([^}]*?)}}/igm,
        ifEnd: /{{\/if}}/igm,
        elseStart: /{{#else}}/igm,
        elseifStart: /{{#elseif\s*([^}]*?)}}/igm
    }

    var _makeTemplate = function (_tpl) {

        var _variables = [], _tplArr = _tpl.split('\n');

        _tplArr.forEach(function (_tplOne, i) {
            _tplArr[i] = _tplOne.trim();
        })

        var _tmp = _g.$unescape(_tplArr.join('') || _tpl).replace(/"/igm, "'");

        // 模板变量声明叠加
        var prefix = '', _counter = 0,
            _convert = ' \
                "use strict"; \
                var _tpl = {}; \
                var _out = ""; \
                var _event = []; \
                var _eventCount = 0; \
                try { \
                    <%innerFunction%>"; \
                    var _result = _render.bind(this); \
                    return _result(_out, "tpl_event", _event, _helper, _dataCache); \
                } catch(e) {throw new Error("$tpl: "+e.message);}';

        var _html = _tmp

            // comment expression
            .replace(_settings.comment, '')

            // list expression
            .replace(_settings.listStart, function ($, _target, _object) {
                var _var = _object || 'value';
                var _key = 'key' + _counter++;
                if (!_target.match(/\./g))_variables.push(_target);
                if (_target.match(/(\w+?)\[/g)) _variables.push(_target.match(/(\w+?)\[/g)[0].replace('[', ''));
                return '";~function() { ' +
                    'var i' + _counter + ' = 0;' +
                    'for(var ' + _key + ' in ' + _target + ') {' +
                    'if(' + _target + '.hasOwnProperty(' + _key + ')) {' +
                    'var _i = i' + _counter + '++;' +
                    'var _v = ' + _target + '[' + _key + ']; ' +
                    'var ' + _var + ' = typeof( _v ) === "object" ? _v : [_v];' + _var + '._index = _i' +
                    '; _out += "'
            })
            .replace(_settings.listEnd, '";}}}(); _out += "')

            // if expression
            .replace(_settings.ifStart, function ($, _condition) {
                return '"; if(' + _condition + ') { _out+="';
            })
            .replace(_settings.ifEnd, '";}_out+="')

            // else expression
            .replace(_settings.elseStart, function ($) {
                return '"; } else { _out+="';
            })

            // else if expression
            .replace(_settings.elseifStart, function ($, condition) {
                return '"; } else if(' + condition + ') { _out+="';
            })

            // event expression
            .replace(_settings.eventReg, function ($, _event, _fn) {
                var _reg = /\((.*?)\)/i;
                if (_reg.test(_fn)) {
                    var _arr = RegExp.$1.split(',');
                    var _pArr = [];
                    var _pCount = 0;
                    _arr.forEach(function (param) {
                        if (param.indexOf("'") < 0 && isNaN(param) && param.indexOf(".") > 0 && param != '$event') {
                            _variables.push(param.split('.')[0]);
                            _pArr.push(param);
                            _fn = _fn.replace(param, 'tpl_P[' + _pCount++ + ']');
                        }
                    })
                }
                return '";_out+="tpl_event="+(_eventCount++); _event.push({E: "' + _event + '", F: "' + _fn + '", P: [' + _pArr + ']}); _out += "';
            })

            // interpolate expression
            .replace(_settings.interpolate, function ($, _name) {
                _variables.push(_name.split('.')[0])
                return '"; _out+=' + _name + '; _out += "';
            });

        // tpl parse
        for (var i = 0, l = _variables.length; i < l; i++) {
            var _variable = _variables[i].replace(/\[.+\]/g, '');
            prefix += 'var ' + _variable + ' = _data.' + _variable + (i == l - 1 ? '||"' : '||"";');
        }

        if (_html.indexOf('"') > 0) prefix += '"; _out += "';
        var _result = _convert.replace(/<%innerFunction%>/g, prefix + _html);
        return new Function('_data, _dataCache, _helper, _render', _result);
    }

    var $tpl = function (param) {
        if (!_g.$isObject(param)) return false;
        return new $tpl.fn._init(param);
    }

    $tpl.fn = $tpl.prototype = {

        constructor: $tpl,

        $container: document,

        _init: function (param) {

            var _hash = _g.$hash().replace('?', '');
            param.$hash = _g.$s2o(_hash, '&') || {};
            param.$update = this.$update.bind(this);
            param.$container = this.$container;
            if (_g.$isFunction(param.$init)) param.$init();

            this.param = param;
            this.template = param.template || '';
            this.data = param.data ? _g.$clone(param.data) : {};
            this._dataCache = _g.$clone(this.data, true);
            if (!this.template) throw new Error('template is null or not defined!');

            this._tplFactory = _makeTemplate(this.template);
            this._tpl = this._creatDom();

            return this;
        },

        _hashController: function () {
            var _param = this.param || {};
            var _focus = _param.$focus || null;
            if (_g.$isArray(_focus)) {
                var _data = this.data;
                var _hash = _param.$hash;
                _focus.forEach(function (key) {
                    var _value = _data[key];
                    if (_value) _hash[key] = _value;
                }.bind(this))
                _g.$hash('!' + _g.$o2s(_hash, '&'));
            }
        },

        _creatDom: function () {

            // parse tpl and add event function
            var _render = function (_html, _target, _event, _u, _dataCache) {
                var _times = 0;
                var _node = _u.$parseHTML(_html);
                var _fragment = document.createDocumentFragment();
                _fragment.appendChild(_node);
                var _cnt = _fragment.childNodes[0];
                if (!!_cnt) {
                    var _list = _cnt.getElementsByTagName("*");
                    for (var i = 0, n = _list.length; i <= n; i++) {
                        var _n = (i == n ? _cnt : _list[i]);
                        var _tmp = _n.getAttribute(_target);
                        if (_tmp) {
                            var _o = _event[_tmp];
                            _u.$addEvent(_n, _o.E, (function (_o) {
                                return function ($event) {
                                    var _f = function (_fs, $w, _g) {
                                        var _tmp = new Function("$event, tpl_P, $w, _g", _fs);
                                        _tmp.call(this, $event, _o.P, $w, _g);
                                    };
                                    // fuck IE
                                    try {
                                        _f.call(this, _o.F, $w, _g);
                                    } catch (e) {
                                        try {
                                            _f.call(this, "this.data." + _o.F);
                                        } catch (e) {
                                            return false;
                                        }
                                    }
                                    // auto
                                    if (!_u.$same(_dataCache, this.data, true)) this.$update();
                                }.bind(this)
                            }.bind(this))(_o));
                            _n.removeAttribute(_target);
                            if (++_times == _event.length) break;
                        }
                    }
                }
                return _fragment;
            }

            var _tpl = this._tplFactory.apply(this.param, [this.data, this._dataCache, _g, _render]);
            return _tpl;
        },

        // async get data function
        $get: function () {
            // todo
        },

        $update: function () {

            // auto
            this._hashController();
            this._dataCache = _g.$clone(this.data, true);

            var _hash = _g.$hash();
            var _hashReg = /(\w+)\s*(=|%3D)\s*(\w+)/igm;

            if (_hashReg.test(_hash)) {
                var _newHash = '';
                _hash.replace(_hashReg, function ($, name, char) {
                    if (this.data[name])  _newHash += ( name + char + this.data[name] );
                }.bind(this));
                console.log(_newHash)
            }

            this._tpl = this._creatDom();
            if (!!this._node) {
                this._node.innerHTML = '';
                this._node.appendChild(this._tpl);
            }
            console.log('refresh');
        },

        $extend: function (newParam) {
            var _stack = [];
            var _parent = this;
            _g.$forIn(_parent.param, function (attr, key) {
                if (!newParam[key]) newParam[key] = _g.$clone(attr, true);
                else if (_g.$isFunction(newParam[key])) _stack.push(key);
            });
            newParam.$super = function () {
                if (!_parent.param) return false;

                var _name = '';
                var _method = arguments.callee.caller;
                _g.$forIn(_stack, function (_fn) {
                    var _n = _parent.param[_fn];
                    if (_g.$same(_n, _method)) _name = _fn;
                });
                if (_name) _parent.param[_name].apply(newParam, arguments);
            }
            newParam.$parent = _parent;
            return $tpl(newParam);
        },

        $inject: function (selector) {
            var _node = _g.dom.get(selector)[0];
            if (!_node) throw new Error('inject node is null or not defined!');
            this.param.$container = this._node = _node;
            _node.innerHTML = '';
            _node.appendChild(this._tpl);
            return this;
        }
    }

    $tpl.fn._init.prototype = $tpl.fn;

    $tpl.fn.$on = _g.$on;
    $tpl.fn.$off = _g.$off;

    return $tpl;
})