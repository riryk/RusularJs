function createModulesBootstrapper(providerInjector, moduleLoader) {
    var loadedModules = [];

    return loadModules;

    function loadModules(modulesToLoad) {
        var runBlocks = [];
        forEachNotLoadedModules(modulesToLoad, function() {
            if (isString(module)) {
                var moduleConfig = moduleLoader(module);
                var dependentRunBlocks = loadModules(moduleConfig.dependencies);
                runBlocks = runBlocks.concat(dependentRunBlocks).concat(moduleConfig.runBlocks);
                processInvokeQueue(moduleConfig.invokeQueue);
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
        return loadedModules.get(module);
    }

    function markModuleAsLoaded(module) {
        loadedModules.put(module, true);
    }

    function processInvokeQueue(invokeQueue) {
        loop(invokeQueue, function(invokeItems) {
            var provider = providerInjector.get(invokeItems[0]);
            provider[invokeItems[1]].apply(provider, invokeItems[2]);
        });
    }

    function loop(array, action) {
        for (var index = 0; index < array.length; index++) {
            action(array[index]);
        }
    }
}
