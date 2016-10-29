
var Lexer = function (options) {

    this.options = options;
};

Lexer.prototype = {

    constructor: Lexer,

    lex: function (text) {
        this.text = text;

        this.index = 0;
        this.ch = undefined;
        this.lastCh = ":"; 

        this.tokens = [];

        var token;
        var json = [];

        while (this.index < this.text.length) {

            this.ch = this.text.charAt(this.index);

            if (this.isWhitespace(this.ch)) {
                this.index++;
                continue;
            }

            this.lastCh = this.ch;
        }
    },

    readIdent: function() {
        var parser = this;
        var ident = '';
        var lastDot, ch;

        while (this.index < this.text.length) {
            ch = this.text.charAt(this.index);
            if (ch === "." || this.isIdent(ch) || this.isNumber(ch)) {
                if (ch === ".") lastDot = this.index;
                ident += ch;
            } else {
                break;
            }
            this.index++;
        }

        var token = {
            index: start,
            text: ident
        };

        var getter = getterFnCache[ident];
        token.fn = extend(function (self, locals) {
            return (getter(self, locals));
        }, {
            assign: function (self, value) {
                return setter(self, ident, value, parser.text, parser.options);
            }
        });

        this.tokens.push(token);
    },

    isWhitespace: function (ch) {
        return (ch === ' ' || ch === '\r' || ch === '\t' ||
                ch === '\n' || ch === '\v' || ch === '\u00A0');
    },

    isIdent: function (ch) {
        return ('a' <= ch && ch <= 'z' ||
                'A' <= ch && ch <= 'Z' ||
                '_' === ch || ch === '$');
    }
}


