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

    var _clone = function (obj) {

        if (null == obj || !_g.$isObject(obj)) return obj;

        var copy = obj.constructor();
        for (var attr in obj) copy[attr] = obj[attr];

        return copy;
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
                var _event = [];\
                try { \
                    var _eventCount = 0;\
                    <%innerFunction%>"; \
                    _out = _helper.$parseHTML(_out); \
                    var _fragment = document.createDocumentFragment(); \
                    _fragment.appendChild(_out); \
                    var _cnt = _fragment.childNodes[0]; \
                    if(!!_cnt){\
                        var _list = _cnt.getElementsByTagName("*");\
                        for (var i = 0, n = _list.length; i < n; i++) {\
                            var _o = _list[i];\
                            var _tmp = _o.getAttribute("tpl_event");\
                            if(_tmp){\
                                var _rxp = /@p([0-9]*)/igm; \
                                _event[_tmp].F.replace(_rxp, function($, _a){\
                                    console.log(_event[_tmp].P);\
                                })\
                            }\
                        }\
                    }\
                    return _fragment; \
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
                        if (param.indexOf("'") < 0 && isNaN(param)) {
                            _variables.push(param.split('.')[0]);
                            _pArr.push(param);
                            _fn = _fn.replace(param, '@P' + _pCount++);
                        }
                    })
                }
                return '";_out+="tpl_event="+(_eventCount++); _event.push({E: "' + _event + '", F: "' + _fn + '", P: ' + _pArr + '}); _out += "';
                //return 'tplEvent = ";_out+="' + _event + '"  ;_out+=" tplFn = ' + _fn;
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

        if (_html.indexOf('"') > 0) prefix += '"; _out += "'
        var _result = _convert.replace(/<%innerFunction%>/g, prefix + _html);
        console.log(_result)
        return new Function('_data, _helper', _result);
    }

    var $tpl = function (param) {
        return new $tpl.fn._init(param);
    }

    $tpl.fn = $tpl.prototype = {

        constructor: $tpl,

        _init: function (param) {
            if (_g.$isFunction(param.$init)) param.$init();
            this.param = param;
            this.template = param.template || '';
            this.data = _clone(param.data) || {};

            this._dataCache = _clone(this.data);
            if (!this.template) throw new Error('template is null or not defined!');

            this._tplFactory = _makeTemplate(this.template);
            this._tpl = this._creatDom();

            return this;
        },

        _creatDom: function () {

            // parse function todo
            var _tpl = this._tplFactory.call(this.param, this.data, _g);
            return _tpl;
        },

        $update: function () {
            this._tpl = this._creatDom();
            if (!!this._node) {
                this._node.innerHTML = '';
                this._node.appendChild(this._tpl);
            }
            return this;
        },

        $extend: function () {

        },

        $inject: function (selector) {
            var _node = _g.dom.get(selector)[0]
            if (!_node) throw new Error('inject node is null or not defined!');
            this._node = _node;
            _node.innerHTML = '';
            _node.appendChild(this._tpl);
            return this;
        }
    }

    $tpl.fn._init.prototype = $tpl.fn;

    return $tpl;
})