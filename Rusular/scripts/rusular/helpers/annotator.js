
function createAnnotate() {
    var argumentsSplitter = /,/;
    var argumentsRegex = /^\s*(_?)(\S+?)\1\s*$/;
    var argumentRegex = /^\s*(_?)(\S+?)\1\s*$/;
    var skipCommentsRegex = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    return annotate;

    function annotate(functionToAnnotate) {
        if (isArray(functionToAnnotate)) {
            return functionToAnnotate.slice(0, functionToAnnotate.length - 1);
        }

        if (!isFunction(functionToAnnotate)) {
            throw Error("Argument is not a function");
        }

        if (!functionToAnnotate.inject) {
            functionToAnnotate.inject = convertFunctionArgumentsToArray(func);
        }

        return functionToAnnotate.inject;
    }

    function convertFunctionArgumentsToArray(functionToConvert) {
        var arguments = [];
        if (!functionToConvert.length) {
            return arguments;
        }

        var functionText = functionToConvert.toString().replace(skipCommentsRegex, "");
        var functionArgumentsText = functionText.match(argumentsRegex);
        var functionArguments = functionArgumentsText[1].split(argumentsSplitter);

        forEach(functionArguments, function (functionArgument) {
            functionArgument.replace(argumentRegex, function (all, underscore, name) {
                arguments.push(name);
            });
        });

        return arguments;
    }

    function isFunction(functionToAnnotate) {
        return typeof functionToAnnotate === "function";
    }
}

