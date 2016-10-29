function moduleFactory() {
    var modules = {};

    return function (moduleName, moduleDependencies, moduleConfigFunction) {
        return window.addPropertyToObjectAndReturn(modules, moduleName, function () {
            var invokeQueue = [];
            var blocksToRun = [];
            var config = invokeLater("injector", "invoke");

            var moduleInstance = {
                invokeQueue: invokeQueue,
                blocksToRun: blocksToRun,
                dependencies: moduleDependencies,
                name: name,
                provider: invokeLater("provide", "provider"),
                factory: invokeLater("provide", "factory"),
                service: invokeLater("provide", "service"),
                value: invokeLater("provide", "value"),
                constant: invokeLater("provide", "constant", "unshift"),
                animation: invokeLater("animateProvider", "register"),
                filter: invokeLater("filterProvider", "register"),
                controller: invokeLater("controllerProvider", "register"),
                directive: invokeLater("compileProvider", "directive"),
                config: config,
                run: function (block) {
                    blocksToRun.push(block);
                    return this;
                }
            };

            runConfigFunction();

            return moduleInstance;

            function invokeLater(provider, method) {
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