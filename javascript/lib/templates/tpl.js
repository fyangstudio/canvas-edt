define([
    'lib!util/global',
    'lib!/util/klass'
], function (_g, k, $p, $f, $w) {

    // 方法匹配
    var _settings = {
        listStart: /{{#list\s*([^}]*?)\s*as\s*(\w*?)\s*(,\s*\w*?)?}}/igm,
        listEnd: /{{\/list}}/igm,
        interpolate: /{{([\s\S]+?)}}/igm,
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

    var _isDiff = function (a, b) {

        if (_g.$isObject(a) || _g.$isObject(b)) return !a === b;
        else {
            // first traversal
            if (_g.$isArray(a)) for (var i = 0, al = a.length; i < al; i++) if (b[i] === undefined) return true;
            else for (var i in a) if (a.hasOwnProperty(i)) if (b[i] === undefined) return true;
            // second traversal
            if (_g.$isArray(b)) for (var j = 0, bl = b.length; j < bl; j++) if (a[j] === undefined) return true;
            else for (var j in b) if (b.hasOwnProperty(j)) if (a[j] === undefined) return true;
        }
        // they are same
        return false;
    };

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
                } catch(e) {throw new Error("pptpl: "+e.message);}';

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
        return new Function('_data', _result);
    }

    var $tpl = function (param) {
        return new $tpl.fn._init(param);
    }

    $tpl.fn = $tpl.prototype = {

        constructor: $tpl,

        _init: function (param) {
            if (_g.$isFunction(param.$init)) param.$init();
            this.tpl = param.template || '';
            this.data = _clone(param.data) || {};

            this._dataCache = this.data;
            if (!this.tpl) throw new Error("template is null or not defined");

            this._tplFactory = _makeTemplate(this.tpl);
            console.log(this._tplFactory(this.data));

            return this;
        },

        $update: function () {

        },

        $extend: function () {

        },

        $inject: function (selector) {
            console.log(selector)
        }
    }

    $tpl.fn._init.prototype = $tpl.fn;

    return $tpl;
})
;