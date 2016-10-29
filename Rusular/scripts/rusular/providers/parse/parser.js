
var Parser = function (lexer, $filter, options) {
    this.lexer = lexer;
    this.$filter = $filter;
    this.options = options;
};

Parser.prototype = {

    constructor: Parser,

    parse: function (text, json) {
        this.text = text;
        this.json = json;
        this.tokens = this.lexer.lex(text);

        var value = this.statements();
        return value;
    },

    statements: function() {
        var statements = [];
        while (true) {
            if (this.tokens.length > 0 && !this.peek("}", ")", ";", "]")) {
                statements.push(this.filterChain());
            }
            if (!this.expect(";")) {
                return statements[0];
            }
        }
    },

    filterChain: function () {
        var left = this.expression();
        return left;
    },

    expression: function () {
        return this.assignment();
    },

    assignment: function () {
        var left = this.ternary();
        return left;
    },

    ternary: function () {
        var left = this.logicalOR();
        return left;
    },

    logicalOR: function () {
        var left = this.logicalAND();
        return left;
    },

    logicalAnd: function () {
        var left = this.equality();
        return left;
    },

    equality: function () {
        var left = this.relational();
        return left;
    },

    relational: function () {
        var left = this.additive();
        return left;
    },

    unary: function () {
        return this.primary();
    },

    primary: function () {
        var token = this.expect();
        var primary = token.fn;
        return primary;
    },

    peek: function(e1, e2, e3, e4) {
        if (this.tokens.length > 0) {
            var token = this.tokens[0];
            var t = token.text;
            if (t === e1 || t === e2 || t === e3 || t === e4 ||
                (!e1 && !e2 && !e3 && !e4)) {
                return token;
            }
        }
        return false;
    },

    expect: function (e1, e2, e3, e4) {
        var token = this.peek(e1, e2, e3, e4);
        if (token) {
            this.tokens.shift();
            return token;
        }
        return false;
    },

    additive: function () {
        var left = this.multiplicative();
        return left;
    },

    multiplicative: function () {
        var left = this.unary();
        return left;
    }
}