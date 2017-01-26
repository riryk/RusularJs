
function rootScopeProvider() {

    var ttl = 10;

    this.digestTtl = function (value) {
        if (arguments.length) {
            ttl = value;
        }
        return ttl;
    };

    this.get = ["injector", "exceptionHandler", "parse", "browser",
            function (injector, exceptionHandler, parse, browser) {

                var rootScope = new Scope();

                return rootScope;
            }];
}