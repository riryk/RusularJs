
function $ControllerProvider() {
    this.$get = ["$injector", "$window", function ($injector, $window) {
        return function (expression, locals) {
            var instance;
            instance = $injector.instantiate(expression, locals);
            return instance;
        };
    }];
}