function moduleFactory() {
    var modules = {};

    return function (moduleName, moduleDependencies, moduleConfigFunction) {
        return window.getOrAddProperty(modules, moduleName, function () {
            var invokeQueue = [];
            var blocksToRun = [];
            var config = addToInvokeQueue("injector", "applyServiceFunction");

            var moduleInstance = {
                invokeQueue: invokeQueue,
                blocksToRun: blocksToRun,
                dependencies: moduleDependencies,
                name: moduleName,
                provider: addToInvokeQueue("provide", "provider"),
                factory: addToInvokeQueue("provide", "factory"),
                service: addToInvokeQueue("provide", "service"),
                value: addToInvokeQueue("provide", "value"),
                constant: addToInvokeQueue("provide", "constant", "unshift"),
                animation: addToInvokeQueue("animateProvider", "register"),
                filter: addToInvokeQueue("filterProvider", "register"),
                controller: addToInvokeQueue("controllerProvider", "register"),
                directive: addToInvokeQueue("compileProvider", "directive"),
                config: config,
                run: function (block) {
                    blocksToRun.push(block);
                    return this;
                }
            };

            runConfigFunction();

            return moduleInstance;

            function addToInvokeQueue(provider, method) {
                return function () {
                    invokeQueue.push([provider, method, arguments]);
                    return moduleInstance;
                };
            }

            function runConfigFunction() {
                if (moduleConfigFunction) {
                    config(moduleConfigFunction);
                }
            }
        });
    }
}