
function $TemplateCacheProvider() {
    this.$get = ["$cacheFactory", function ($cacheFactory) {
        return $cacheFactory("templates");
    }];
}