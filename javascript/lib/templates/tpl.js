define([
    'lib!util/global',
    'lib!/util/klass'
], function (_g, k, $p, $f, $w) {

    // “全局变量”统计
    var _variables = [];

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

    var $tpl = function (param) {
        return new $tpl.fn._init(param);
    }
    console.log(_g.$parseHTML('<li>xxx</li><li>xxx</li>'))

    $tpl.fn = $tpl.prototype = {

        constructor: $tpl,

        _init: function (param) {
            if (_g.$isFunction(param.$init)) param.$init();
            this.tpl = param.template;
            this.data = _clone(param.data) || {};

            // 待优化
            var _tplArr = this.tpl.split('\n');

            _tplArr.forEach(function (_tplOne, i) {
                _tplArr[i] = _tplOne.trim();
            })

            var _tpl = _g.$unescape(_tplArr.join('') || this.tpl).replace(/"/igm, "'");

            // 模板变量声明叠加
            var prefix = '';

            // 循环调用统计
            var _counter = 0;

            // 模板编译 主结构
            var _convert = '"use strict"; var _out = "";try { <%innerFunction%>";return _out;} catch(e) {throw new Error("pptpl: "+e.message);}';

            var _html = _tpl

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

            if (_html.indexOf('"') > 0) {
                prefix += '"; _out += "'
            }

            var tpl = _convert.replace(/<%innerFunction%>/g, prefix + _html);

            var _render = new Function('_data', tpl);

            var _result = _render.call(this, this.data);

            console.log(_result)


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