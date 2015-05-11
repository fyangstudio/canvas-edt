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


            console.log(_isDiff(this.data, param.data))
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

    $tpl({
        template: '',
        $init: function () {
            this.data = {a: 1, b: 2, c: 3};
        },
        test: function () {

        }
    }).$inject('#test')

    var pptpl = function (_tpl, _data) {

        var _tplArr = _tpl.split('\n');

        _tplArr.forEach(function (_tplOne, i) {
            _tplArr[i] = _tplOne.trim();
        })

        _tpl = (_tplArr.join('') || _tpl).replace(/&lt;/igm, '<').replace(/&gt;/igm, '>').replace(/&amp;/igm, '&').replace(/"/igm, "'");

        pptpl.options = {
            tpl: _tpl,
            data: _data
        };

        _variables = [];
        return pptpl.template.call(pptpl);
    }

    pptpl.template = function () {

        var _data = pptpl.options.data;

        setTimeout(function () {
            console.log(_data.info.name)
        }, 1000);

        // 模板变量声明叠加
        var prefix = '';

        // 循环调用统计
        var _counter = 0;

        // 模板编译 主结构
        var _convert = '"use strict"; var _out = "";try { <%innerFunction%>";return _out;} catch(e) {throw new Error("pptpl: "+e.message);}';

        var _tpl = this.options.tpl

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

        if (_tpl.indexOf('"') > 0) {
            prefix += '"; _out += "'
        }

        var tpl = _convert.replace(/<%innerFunction%>/g, prefix + _tpl);

        var _render = new Function('_data', tpl);

        var _result = _render.call(this, pptpl.options.data);

        return _result
    }

    return pptpl;
})
;