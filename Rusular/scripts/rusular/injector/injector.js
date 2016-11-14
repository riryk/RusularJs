
function createInjector(getModule, modulesToLoad) {
    var providerSuffix = "Provider";

    var instanceCache = {};
    var providerCache = {
        provide: {
            provider: addProvider,
            factory: addFactory,
            service: addService,
            constant: addConstant
        }
    };

    var providerInjector = createInternalInjector(providerCache, throwUnknownProviderException);
    providerCache.injector = providerInjector;

    var instanceInjector = createInternalInjector(instanceCache, instantiateService);
    instanceCache.injector = instanceInjector;

    var bootstrapModules = createModulesBootstrapper(providerInjector, getModule);
    var moduleRunBlocks = bootstrapModules(modulesToLoad);

    invokeRunBlocks(moduleRunBlocks);

    function invokeRunBlocks(runBlocks) {
        forEach(runBlocks, function (runBlock) {
            instanceInjector.invoke(runBlock || doNothingRunBlock);
        });
    }

    function instantiateService(serviceName) {
        var provider = providerInjector.get(serviceName + providerSuffix);
        return instanceInjector.invoke(provider.$get, provider);
    }

    function addProvider(name, provider) {

        if (isFunctionOrArray(provider)) {
            provider = providerInjector.instantiate(provider);
        }
        if (!provider.get) {
            throw Error("Provider '{0}' must define get factory method.", name);
        }
        return providerCache[name + providerSuffix] = provider;
    }

    function addFactory(name, factory) {
        return addProvider(name, { get: factory });
    }

    function addService(name, serviceConstructor) {
        return addFactory(name, ["injector", function (injector) {
            return injector.instantiate(serviceConstructor);
        }]);
    }

    function addConstant(constantName, constantValue) {
        providerCache[constantName] = constantValue;
        instanceCache[constantName] = constantValue;
    }

    function throwUnknownProviderException() {
        throw Error("Unknown provider");
    }

    function doNothingRunBlock() { }

    doNothingRunBlock.inject = [];
}



