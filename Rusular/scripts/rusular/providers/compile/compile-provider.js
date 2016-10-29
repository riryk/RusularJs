
function compileProvider($provide, $sanitizeUriProvider) {

    var suffix = "Directive";
    var registeredDirectives = {};

    function directiveFactory($injector, $exceptionHandler) {
        var directives = [];
        forEach(registeredDirectives[name], function (directiveFactory, index) {
            try {
                var directive = $injector.invoke(directiveFactory);
                if (isFunction(directive)) {
                    directive = { compile: valueFn(directive) };
                } else if (!directive.compile && directive.link) {
                    directive.compile = valueFn(directive.link);
                }
                directive.priority = directive.priority || 0;
                directive.index = index;
                directive.name = directive.name || name;
                directive.require = directive.require || (directive.controller && directive.name);
                directive.restrict = directive.restrict || "A";
                directives.push(directive);
            } catch (e) {
                $exceptionHandler(e);
            }
        });
        return directives;
    }

    function registerSingleDirective(name, directiveFactory) {
        if (!registeredDirectives.hasOwnProperty(name)) {
            registeredDirectives[name] = [];
            $provide.factory(name + suffix, ["$injector", "$exceptionHandler", directiveFactory]);
        }
        registeredDirectives[name].push(directiveFactory);
    }

    function registerDirective(name, directiveFactory) {
        if (!isString(name)) {
            forEach(name, reverseParams(registerDirective));
            return;
        }
        registerSingleDirective(name, directiveFactory);
    }

    this.$get = [
        "$injector", "$interpolate", "$exceptionHandler", "$http", "$templateCache", "$parse",
        "$controller", "$rootScope", "$document", "$sce", "$animate", "$$sanitizeUri",
        function($injector, $interpolate, $exceptionHandler, $http, $templateCache, $parse,
             $controller, $rootScope, $document, $sce, $animate, $$sanitizeUri) {

        }
    ];
}