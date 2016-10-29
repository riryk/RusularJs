
function $HttpProvider() {
    this.$get = ["$httpBackend", "$browser", "$cacheFactory", "$rootScope", "$q", "$injector",
        function ($httpBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {
            $http.pendingRequests = [];
            $http.defaults = defaults;
            return $http;
        }];
}