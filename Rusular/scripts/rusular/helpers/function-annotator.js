function FunctionAnnotator() {
	var functionArgumentsSplitter = /,/;
	var functionArgumentsRegex = /^\s*(_?)(\S+?)\1\s*$/;
	var functionArgumentRegex = /^\s*(_?)(\S+?)\1\s*$/;
	var skipCommentsRegex = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

	function parseFunctionArguments(func) {
		var funcArguments = [];
		if (!func.length) {
			return funcArguments;
		}

		var functionText = func.toString().replace(skipCommentsRegex, "");
		var functionArgumentsText = functionText.match(functionArgumentsRegex);
		var functionArguments = functionArgumentsText[1].split(functionArgumentsSplitter);

		forEach(functionArguments, function (functionArgument) {
			functionArgument.replace(functionArgumentRegex, function (all, underscore, name) {
				funcArguments.push(name);
			});
		});

		return funcArguments;
	}

	function annotate(func) {
	    if (isArray(func)) {
	        return func.slice(0, func.length - 1);
	    }

	    if (typeof func !== "function") {
	        throw Error("Argument is not a function");
	    }

	    if (!func.$inject) {
	        func.$inject = parseFunctionArguments(func);
	    }

	    return func.$inject;
	}

    return {
        annotate: annotate
    };
};
