
function createInternalInjector(cache, serviceFactory) {

    return {
        invokeService: invokeService,
        instantiate: instantiate,
        getService: getService
    };

    function getService(serviceName) {
        if (!cache.hasOwnProperty(serviceName)) {
            cache[serviceName] = serviceFactory(serviceName);
        }
        return cache[serviceName];
    }

    function invokeService() {
    }

    function instantiate(type, parameters) {
        var constructor = function() {};
        var isTypeAnnotated = isArray(type);

        constructor.prototype = (isTypeAnnotated ? type[type.length - 1] : type).prototype;
        var instance = new constructor();
        var returnedValue = invokeFunction(type, instance, parameters);

        return isObject(returnedValue) || isFunction(returnedValue) ? returnedValue : instance;
    }

    function invokeFunction(functionToInvoke, self, parameterValues) {
        var arguments = [];
        var parameterNames = window.annotate(functionToInvoke);

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

        var funcIsArray = !functionToInvoke.$inject;
        if (funcIsArray) {
            functionToInvoke = functionToInvoke[parameterNames.length];
        }

        return functionToInvoke.apply(self, arguments);
    }
}