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
        type: function (a, b) {
            if (a && Array.isArray(b)) {
                if (!(a in zoo.types)) {
                    zoo.types[a] = require('zoo-type-' + a);
                }
                return new zoo.types[a](b);
            }
            if (a) {
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
                if (!a.type) {
                    throw new Error('Unknown value type');
                }
                return a.type;
            }
        },

        /**
         * Execute instructions of bytecode
         */
        execute: function (code) {
            var obj = zoo.type('object', zoo.load(code));
            return obj.run();
        },

        /**
         * Parse instructions of bytecode
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
            var source = [];

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
                    return source;
                }

                /**
                 * Absorb all subsequent code starting with an &
                 */
                while (seq + 1 in code && code[seq + 1][0] === '&') {
                    seq++;
                    data += '\n' + code[seq].substr(1);
                }

                source.push([sym, data, line, col]);
            }

            return source;
        }
    };

    return zoo;
};
