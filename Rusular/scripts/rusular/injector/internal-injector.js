
function createInternalInjector(cache, serviceFactory) {

    return {
        getService: getService,
        instantiate: instantiateService
    };

    function getService(serviceName) {
        if (!cache.hasOwnProperty(serviceName)) {
            cache[serviceName] = serviceFactory(serviceName);
        }
        return cache[serviceName];
    }

    function instantiateService(service, dependentServiceInstances) {
        var arguments = [];
        var dependentServices = window.annotate(service);

        loopThrough(dependentServices, function (name) {

            var instance = dependentServiceInstances.hasOwnProperty(name)
                ? dependentServiceInstances[name] :
                getService(name);

            arguments.push(instance);
        });

        if (!service.inject) {
            service = service[dependentServices.length];
        }

        var serviceInstance = createInstanceAndInheritFrom(service);
        var newService = service.apply(serviceInstance, arguments);

        return isObjectOrFunction(newService) ? newService : serviceInstance;
    }

    function createInstanceAndInheritFrom(service) {
        var NewService = function () { };
        var isServiceAnnotated = isArray(service);

        NewService.prototype = (isServiceAnnotated ? service[service.length - 1] : service).prototype;
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