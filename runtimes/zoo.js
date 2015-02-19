/**
 * JavaScript Runtime for Zoo
 * @author Nate Ferrero
 */
var fs = require('fs');
var path = require('path');

module.exports = function (context) {
    var zoo = {

        /**
         * Read and execute a file synchronously
         */
        require: function (filename) {
            return zoo.execute(
                fs.readFileSync(
                    path.join(
                        path.dirname(context.filename), filename
                    ), 'utf8'
                )
            );
        },

        /**
         * Types
         */
        types: {},

        /**
         * Type
         */
        type: function (type, code, scope) {
            if (!(type in zoo.types)) {
                zoo.types[type] = require('zoo-' + type);
            }
            if (Array.isArray(code)) {
                var instance = new zoo.types[type](scope);
                Object.defineProperty(instance, '#code', {
                    enumerable: false,
                    value: code
                });
                Object.defineProperty(instance, '#type', {
                    enumerable: false,
                    value: type
                });
                return instance;
            }
            else {
                return zoo.types[type];
            }
        },

        /**
         * Get type name
         */
        typename: function (a) {
            if (a === void 0) {
                return 'undefined';
            }
            if (a === null) {
                return 'null';
            }
            if (typeof a === 'boolean') {
                return 'boolean';
            }
            if (typeof a === 'number') {
                return 'number';
            }
            if (typeof a === 'string') {
                return 'string';
            }
            if (!a['#type']) {
                throw new Error('Unknown type name');
            }
            return a['#type'];
        },

        /**
         * Execute instructions from string bytecode
         */
        execute: function (code) {
            var obj = zoo.type('object', zoo.load(code));
            return zoo.run(obj);
        },

        /**
         * Run a scoped object containing #code
         */
        run: function (scope) {
            return zoo.type(zoo.typename(scope)).run(zoo, scope);
        },

        /**
         * Evaluate a parsed bytecode expression in the context of a scope
         */
        expr: function (scope, code) {
            return 'test';
        },

        /**
         * Parse instructions of bytecode into tree structure
         */
        load: function (code) {
            if (typeof code === 'string') {
                code = code.split('\n');
            }

            var line;
            var col;
            var llen;
            var clen;
            var sym;
            var data;
            var root = [];
            var source = root;

            for (var seq = 0; seq < code.length; seq++) {
                /**
                 * Instruction syntax is <llen><clen><line><col><X><...> where X is [abcgioxsv]
                 */
                llen = parseInt(code[seq][0]);
                clen = parseInt(code[seq][1]);
                line = parseInt(code[seq].substr(2, llen));
                col  = parseInt(code[seq].substr(2 + llen, clen));
                sym  = code[seq].charAt(2 + llen + clen);
                data  = code[seq].substr(3 + llen + clen);

                if (isNaN(line) || isNaN(col)) {
                    return root;
                }

                /**
                 * Absorb all subsequent code starting with an &
                 */
                while (seq + 1 in code && code[seq + 1][0] === '&') {
                    seq++;
                    data += '\n' + code[seq].substr(1);
                }

                /**
                 * If we reach an 'e', go up the chain
                 */
                if (sym === 'e') {
                    if (!source.parent) {
                        throw new Error('Cannot go above top source level');
                    }
                    var child = source;
                    source = source.parent;
                    delete child.parent;
                    continue;
                }

                var orig = source;

                /**
                 * If is nested type, group until 'e'
                 */
                if (sym === 'a' || sym === 'c' || sym === 'g' || sym === 'o') {
                    source = data = [];
                    source.parent = orig;
                }

                /**
                 * Else if another known type
                 */
                else if (sym === 'b' || sym === 'i' || sym === 'l' || sym === 's' || sym === 'v') {

                }

                /**
                 * Else this is an operator
                 */
                else {
                    data = sym + data;
                    sym = 'x';
                }

                orig.push([sym, data, line, col]);
            }

            return root;
        }
    };

    return zoo;
};
