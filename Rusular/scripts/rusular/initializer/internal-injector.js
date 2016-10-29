function InternalInjector(cache, serviceFactory) {
    var annotator = new FunctionAnnotator();

	var dependencyCache = cache;
	var dependencyPath = [];
	var instantiating = {};

	function isInstantiating(serviceName) {
	    return dependencyCache[serviceName] === instantiating;
    }

    function addServiceAndReturn(serviceName) {
		try {
			dependencyPath.unshift(serviceName);
			dependencyCache[serviceName] = instantiating;
			return dependencyCache[serviceName] = serviceFactory(serviceName);
		} catch (error) {
		    if (isInstantiating(serviceName)) {
				delete dependencyCache[serviceName];
			}
			throw error;
		} finally {
			dependencyPath.shift();
		}
	};

    function getService(serviceName) {
        if (!dependencyCache.hasOwnProperty(serviceName)) {
            return addServiceAndReturn(serviceName);
        }
		if (isInstantiating(serviceName)) {
			throw Error("Circular dependency found");
		}
		return dependencyCache[serviceName];
	};

	function invokeFunction(func, self, parameterValues) {
	    var arguments = [],
	        parameterNames = annotator.annotate(func);

		for (var i = 0; i < parameterNames.length; i++) {
		    var parameterName = parameterNames[i];
			if (typeof parameterName !== "string") {
				throw Error("Incorrect injection token! Expected service name as string");
			}
			var parameterValue = parameterValues && parameterValues.hasOwnProperty(key)
				? parameterValues[parameterName]
				: getService(parameterName);

			arguments.push(parameterValue);
		}

		var funcIsArray = !func.$inject;
		if (funcIsArray) {
		    func = func[parameterNames.length];
		}

		return func.apply(self, arguments);
	};

	function instantiate(Type, parameters) {
		var Constructor = function() {},
			isTypeAnnotated = isArray(Type);

		Constructor.prototype = (isTypeAnnotated ? Type[Type.length - 1] : Type).prototype;
		var instance = new Constructor();
		var returnedValue = invokeFunction(func, instance, parameters);

		return isObject(returnedValue) || isFunction(returnedValue) ? returnedValue : instance;
	};

	return {
		invoke: invoke,
		instantiate: instantiate,
		get: getService
	};
}