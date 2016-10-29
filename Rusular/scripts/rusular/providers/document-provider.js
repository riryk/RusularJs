function $DocumentProvider() {
    this.$get = ["$window", function (window) {
        return jqLite(window.document);
    }];
}