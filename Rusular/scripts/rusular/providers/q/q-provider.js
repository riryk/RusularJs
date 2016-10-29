
function $QProvider() {
    this.$get = ["$rootScope", "$exceptionHandler", function ($rootScope, $exceptionHandler) {
        return qFactory(function (callback) {
            $rootScope.$evalAsync(callback);
        }, $exceptionHandler);
    }];
}