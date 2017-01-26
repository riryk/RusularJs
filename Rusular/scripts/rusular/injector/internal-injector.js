
function createInternalInjector(cache, serviceFactory) {

    return {
        getService: getService,
        instantiate: instantiateService,
        applyServiceFunction: applyServiceFunction
    };

    function getService(serviceName) {
        if (!cache.hasOwnProperty(serviceName)) {
            cache[serviceName] = serviceFactory(serviceName);
        }
        return cache[serviceName];
    }

    function applyServiceFunction(serviceFunction, serviceInstance, dependentServiceInstances) {

        var servicefunctionArguments = [];

        var dependentServices = window.annotate(serviceFunction);

        loopThrough(dependentServices, function (name) {

            var instance = dependentServiceInstances && dependentServiceInstances.hasOwnProperty(name)
                ? dependentServiceInstances[name] :
                getService(name);

            servicefunctionArguments.push(instance);
        });

        if (!serviceFunction.inject) {
            serviceFunction = serviceFunction[dependentServices.length];
        }

        return serviceFunction.apply(serviceInstance, servicefunctionArguments);
    }

    function instantiateService(serviceFunction, dependentServiceInstances) {

        var serviceInstance = createInstance(serviceFunction);

        var newService = applyServiceFunction(serviceFunction, serviceInstance, dependentServiceInstances);

        return isObjectOrFunction(newService) ? newService : serviceInstance;
    }

    function createInstance(serviceFunction) {

        var NewService = function () { };

        var isServiceAnnotated = isArray(serviceFunction);

        serviceFunction = isServiceAnnotated
            ? serviceFunction[serviceFunction.length - 1]
            : serviceFunction;

        NewService.prototype = serviceFunction.prototype;

        return new NewService();
    }

    function loopThrough(array, action) {
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (!isString(item)) {
                throw Error("Incorrect injection token! Expected service name as string");
            }
            action(item);
        }
    }
}