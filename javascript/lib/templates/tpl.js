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
                var _out = ""; \
                try { \
                    <%innerFunction%>"; \
                    return _out; \
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
                return 'tplEvent = ";_out+="' + _event + '"  ;_out+=" tplFn = ' + _fn;
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
        console.log(_html)
        return new Function('_data', _result);
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
            return _g.$parseHTML(this._tplFactory.call(this.param, this.data));
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