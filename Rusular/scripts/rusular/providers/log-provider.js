function $LogProvider() {
    this.$get = ['$window', function ($window) {
        return {
            log: consoleLog('log'),
            info: consoleLog('info'),
            warn: consoleLog('warn'),
            error: consoleLog('error'),
        };
    }];
}