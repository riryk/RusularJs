
function ParseProvider() {

    var cache = {};

    var parseOptions = {
        csp: false,
        unwrapPromises: false,
        logPromiseWarnings: true
    };

    this.get = ["filter", "sniffer", "log", function (filter, sniffer, log) {
        return parse;
    }];

    function parse(expression) {
        if (typeof expression === "function") {
            return expression;
        }
        if (typeof expression === "string") {
            if (cache.hasOwnProperty(expression)) {
                return cache[expression];
            }

            var lexer = new Lexer(parseOptions);
            var parser = new Parser(lexer, filter, parseOptions);
            var parsedExpression = parser.parse(expression, false);

            if (expression !== "hasOwnProperty") {
                cache[expression] = parsedExpression;
            }

            return parsedExpression;
        }
    }
}