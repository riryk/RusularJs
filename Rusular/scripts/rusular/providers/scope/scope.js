
function Scope(rootScope, parser, exceptionHandler) {

    var self = this;

    self.rootScope = rootScope;
    self.parser = parser;
    self.exceptionHandler = exceptionHandler;

    self.id = nextUid();
    self.phase = null;
    self.parent = null;
    self.watchers = null;
    self.nextSibling = null;
    self.prevSibling = null;
    self.childHead = null;
    self.childTail = null;
    self.destroyed = false;
    self.asyncQueue = [];
    self.postDigestQueue = [];
    self.listeners = {};
    self.listenerCount = {};
    self.isolateBindings = {};
    self.root = self;
    self["this"] = self;

    function beginPhase(phase) {
        if (self.phase) {
            throw new Error("Already in progress");
        }
        self.rootScope.phase = phase;
    }

    function clearPhase() {
        self.rootScope.phase = null;
    }

    function handleException(error) {
    }

    function digestRootScope() {
        try {
            self.rootScope.$digest();
        } catch (e) {
            $exceptionHandler(e);
            throw e;
        }
    }

    function decrementListenerCount(current, count, name) {
        do {
            current.listenerCount[name] -= count;

            if (current.$$listenerCount[name] === 0) {
                delete current.$$listenerCount[name];
            }
        } while ((current = current.$parent));
    }

    function compileToFn(exp, name) {
        var fn = $parse(exp);
        return fn;
    }
}

Scope.prototype = {
    constructor: Scope,
    eval: function (expresion, locals) {
        return this.parser(expresion)(this, locals);
    },
    create: function (isolate) { },
    watchCollection: function (obj, listener) { },
    digest: function() {
        var next, current, watch, target = this;
        var dirty, length;
        var asyncQueue = this.$$asyncQueue;

        this.beginPhase("$digest");
        do {
            dirty = false;
            current = target;
            lastDirtyWatch = null;

            do {
                if ((watchers = current.$$watchers)) {
                    while (length--) {
                        try {
                            watch = watchers[length];
                            if (watch) {
                                if ((value = watch.get(current)) !== (last = watch.last)) {
                                    dirty = true;
                                    lastDirtyWatch = watch;
                                    watch.fn(value, ((last === initWatchVal) ? value : last), current);
                                }
                            }
                        } catch (e) {
                            clearPhase();
                            $exceptionHandler(e);
                        }
                    }
                }

            } while ((current = next));      
        } while (dirty || asyncQueue.length)

        this.clearPhase();
    },
    apply: function(expression) {
        try {
            this.beginPhase("$apply");
            return this.$eval(expr);
        } catch (error) {
            this.handleException(error);
        } finally {
            this.clearPhase();
            this.digestRootScope();
        }
    },
    on: function (name, listener) {
        var namedListeners = this.listeners[name];
        if (!namedListeners) {
            this.listeners[name] = namedListeners = [];
        }
        namedListeners.push(listener);

        var current = this;
        do {
            if (!current.listenerCount[name]) {
                current.listenerCount[name] = 0;
            }
            current.listenerCount[name]++;
        } while ((current = current.parent));

        var self = this;
        return function () {
            namedListeners[indexOf(namedListeners, listener)] = null;
            decrementListenerCount(self, 1, name);
        };
    },
    watch: function (watchExp, listener, objectEquality) {
        var scope = this,
            get = compileToFn(watchExp, 'watch'),
            array = scope.$$watchers,
            watcher = {
                fn: listener,
                last: initWatchVal,
                get: get,
                exp: watchExp,
                eq: !!objectEquality
            };

        if (!isFunction(listener)) {
            var listenFn = compileToFn(listener || noop, 'listener');
            watcher.fn = function (newVal, oldVal, scope) { listenFn(scope); };
        }

        array.unshift(watcher);
        return function () {
            arrayRemove(array, watcher);
            lastDirtyWatch = null;
        };
    }
}