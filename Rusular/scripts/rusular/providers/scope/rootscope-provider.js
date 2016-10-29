function rootScopeProvider() {
    var TTL = 10;
    var $rootScopeMinErr = minErr("$rootScope");
    var lastDirtyWatch = null;

    this.digestTtl = function (value) {
        if (arguments.length) {
            TTL = value;
        }
        return TTL;
    };

    this.$get = ["$injector", "$exceptionHandler", "$parse", "$browser",
            function ($injector, $exceptionHandler, $parse, $browser) {

                var $rootScope = new Scope();

                return $rootScope;
            }];
}