
function $InterpolateProvider() {

    var startSymbol = '{{';
    var endSymbol = '}}';

    this.$get = ["$parse", "$exceptionHandler", "$sce", function ($parse, $exceptionHandler, $sce) {

        var startSymbolLength = startSymbol.length,
            endSymbolLength = endSymbol.length;

        function $interpolate(text, mustHaveExpression, trustedContext) {
            var index = 0, exp, fn,
                startIndex, endIndex,
                parts = [], hasInterpolation = false,
                length = text.length, concat = [];

            while (index < length) {
                startIndex = text.indexOf(startSymbol, index);
                endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength);
                if (startIndex !== -1 && endIndex !== -1) {
                    (index !== startIndex) && parts.push(text.substring(index, startIndex));
                    exp = text.substring(startIndex + startSymbolLength, endIndex);
                    fn = $parse(exp);
                    parts.push(fn);
                    index = endIndex + endSymbolLength;
                    hasInterpolation = true;
                } else {

                }
            }

            if (hasInterpolation) {
                concat.length = length;
                fn = function (context) {
                    try {
                        for (var i = 0, ii = length, part; i < ii; i++) {
                            part = parts[i];
                            if (typeof (part) == "function") {
                                part = part(context);
                            }
                            concat[i] = part;
                        }
                    } catch (err) {

                    }
                };
                fn.exp = text;
                fn.parts = parts;
                return fn;
            }
        }
    }];
}
