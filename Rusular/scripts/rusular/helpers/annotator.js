
function createAnnotate() {
    var argumentsSplitter = /,/;
    var argumentsRegex = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var argumentRegex = /^\s*(_?)(\S+?)\1\s*$/;
    var skipCommentsRegex = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    return annotate;

    function annotate(functionToAnnotate) {

        if (isArray(functionToAnnotate)) {
            return functionToAnnotate.slice(0, functionToAnnotate.length - 1);
        }
        else if (isFunction(functionToAnnotate)) {
            return annotateFunction(functionToAnnotate);
        }

        throw Error("Argument is not a function or array");
    }

    function annotateFunction(functionToAnnotate) {

        if (!functionToAnnotate.inject) {
            functionToAnnotate.inject = convertFunctionArgumentsToArray(functionToAnnotate);
        }

        return functionToAnnotate.inject;
    }

    function convertFunctionArgumentsToArray(functionToConvert) {

        var formattedArguments = [];

        if (!functionToConvert.length) {
            return formattedArguments;
        }

        var functionText = functionToConvert.toString().replace(skipCommentsRegex, "");
        var functionArgumentsText = functionText.match(argumentsRegex);
        var functionArguments = functionArgumentsText[1].split(argumentsSplitter);

        forEach(functionArguments, function (functionArgument) {
            functionArgument.replace(argumentRegex, function (all, underscore, name) {
                formattedArguments.push(name);
            });
        });

        return formattedArguments;
    }

    function isFunction(functionToAnnotate) {
        return typeof functionToAnnotate === "function";
    }
}

