
function RusularBootstrapper(rusQuery, moduleStorage, applicationElement, applicationModules) {
	var application = rusQuery(applicationElement);
	var rusDeferBootstrap = /^RUS_DEFER_BOOTSTRAP!/;
	var shouldDeferBootstrap = window && !rusDeferBootstrap.test(window.name);

    function compileStartElement(scope, element, compile, injector) {
        scope.$apply(function () {
            element.data("$injector", injector);
            compile(element)(scope);
        });
    }

    function bootstrap(element, modules) {
		modules = modules || [];
		if (element.injector()) {
			throw new Error("App Already Bootstrapped with this Element");
		}
		modules.unshift(["$provide", function ($provide) {
			$provide.value("$rootElement", element);
		}]);
		modules.unshift("root");

        var instanceInjector = new InstanceInjector(moduleStorage, modules);
		instanceInjector.invoke(["$rootScope", "$rootElement", "$compile", "$injector", compileStartElement]);
		return instanceInjector;
	}
}

