
$FilterProvider.$inject = ["$provide"];
function $FilterProvider($provide) {
    this.$get = ["$injector", function ($injector) {
        return function (name) {
            return $injector.get(name + suffix);
        };
    }];
}