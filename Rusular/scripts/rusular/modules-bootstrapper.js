function createModulesBootstrapper(providerInjector, getModule) {

    var loadedModules = new HashMap();

    return bootstrapModules;

    function bootstrapModules(modulesToLoad) {
        var runBlocks = [];
        forEachNotLoadedModules(modulesToLoad, function (module) {
            if (isString(module)) {
                var moduleInstance = getModule(module);
                var dependentRunBlocks = bootstrapModules(moduleInstance.dependencies);
                runBlocks = concat(runBlocks, dependentRunBlocks, moduleInstance.runBlocks);
                processInvokeQueue(moduleInstance.invokeQueue);
            }
            else if (isFunction(module)) {
                runBlocks.push(providerInjector.invoke(module));
            }
            else if (isArray(module)) {
                runBlocks.push(providerInjector.invoke(module));
            }
        });
        return runBlocks;
    }

    function forEachNotLoadedModules(modules, moduleFunction) {
        forEach(modules, function (module) {
            if (moduleIsNotLoaded(module)) {
                markModuleAsLoaded(module);
                moduleFunction(module);
            }
        });
    }

    function moduleIsNotLoaded(module) {
        return !loadedModules.get(module);
    }

    function markModuleAsLoaded(module) {
        loadedModules.put(module, true);
    }

    function processInvokeQueue(invokeQueue) {
        loop(invokeQueue, function (invokeItems) {

            var serviceName = invokeItems[0];
            var serviceInstance = providerInjector.getService(serviceName);

            var serviceMethodName = invokeItems[1];
            var serviceMethod = serviceInstance[serviceMethodName];

            var serviceMethodArguments = invokeItems[2];
            serviceMethod.apply(serviceInstance, serviceMethodArguments);
        });
    }

    function loop(array, action) {
        for (var index = 0; index < array.length; index++) {
            action(array[index]);
        }
    }

    function concat(toArray, firstInputArray, secondInputArray) {
        if (firstInputArray) {
            toArray = toArray.concat(firstInputArray);
        }
        if (secondInputArray) {
            toArray = toArray.concat(secondInputArray);
        }
        return toArray;
    }
}
