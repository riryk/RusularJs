function $BrowserProvider() {
    this.$get = ["$window", "$log", "$sniffer", "$document",
        function ($window, $log, $sniffer, $document) {
            return new Browser($window, $document, $log, $sniffer);
        }];
}