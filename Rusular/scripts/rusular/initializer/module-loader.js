function ModuleLoader(moduleStorage, providerInjector) {

    var loadedModules = new HashMap();

    function processInvokeArguments(invokeArguments) {
        var providerName = invokeArguments[0],
		    provider = providerInjector.get(providerName);

        provider[invokeArguments[1]].apply(provider, invokeArguments[2]);
    }

    function processModuleInvokeQueue(module) {
        for (var i = 0; i < module.invokeQueue.length; i++) {
            processInvokeArguments(module.invokeQueue[i]);
		}
	}

    function addModuleToRunBlocks(runBlocks, moduleName) {
	    var nameIsFunctionOrArray = isFunction(moduleName) || isArray(moduleName);
	    if (nameIsFunctionOrArray) {
	        runBlocks.push(providerInjector.invoke(moduleName));
	        return;
	    }
	    if (!isString(moduleName)) {
	        throw Error("Type of module name is unrecognized");
	    }

        var module = moduleStorage.getOrCreateModule(moduleName);
        var requiredModules = loadModules(module.requires);
        var moduleRunBlocks = module.runBlocks;

        runBlocks.concat(requiredModules).concat(moduleRunBlocks);
        processModuleInvokeQueue(module);
    };

    function loadModules(modulesToLoad) {
        var runBlocks = [];

        forEach(modulesToLoad, function(moduleName) {
            if (loadedModules.get(moduleName)) {
                return;
            }
            loadedModules.put(moduleName, true);
            try {
                addModuleToRunBlocks(runBlocks, moduleName);
            } catch (e) {
                throw Error("Failed to instantiate model");
            }
        });

	    return runBlocks;
	}
}