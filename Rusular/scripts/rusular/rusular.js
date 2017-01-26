
(function (window, document) {
    "use strict";

    if (window.rusular) {
        throw new Error("Rusular already initialized");
    }

    window.rusular = {};

    if (!window.jQuery) {
        throw new Error("JQuery is not defined");
    }

    window.rusQuery = window.jQuery;
    window.annotate = createAnnotate();

    function forEach(object, iterator, context) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                iterator.call(context, object[property], property);
            }
        }
    }

    window.forEach = forEach;

    function getOrAddProperty(object, propertyName, propertyValueFactory) {
        return object[propertyName] || (object[propertyName] = propertyValueFactory());
    }

    window.getOrAddProperty = getOrAddProperty;

    function reverseParameters(iteratorFunction) {
        return function (value, key) { iteratorFunction(key, value); };
    }

    window.reverseParameters = reverseParameters;

    function copyAllProperties(sourceObject, targetObject) {
        forEach(sourceObject, function (propertyName, propertyValue) {
            targetObject[propertyName] = propertyValue;
        });
    }

    function extend(destinationObject) {
        forEach(arguments, function (sourceObject) {
            if (sourceObject !== destinationObject) {
                copyAllProperties(sourceObject, destinationObject);
            }
        });
        return destinationObject;
    }

    var uniqueIds = ["0", "0", "0"];

    function nextUniqueId() {
        var digit;

        loopFromEnd(uniqueIds, function (index) {
            digit = uniqueIds[index].charCodeAt(0);
            if (isNine(digit)) {
                uniqueIds[index] = "A";
                return uniqueIds.join("");
            }
            if (isZ(digit)) {
                uniqueIds[index] = "0";
            }
            else {
                uniqueIds[index] = String.fromCharCode(digit + 1);
                return uniqueIds.join("");
            }
        });

        uniqueIds.unshift("0");
        return uniqueIds.join("");
    }

    window.nextUniqueId = nextUniqueId;

    function isNine(digit) {
        return digit === 57;
    }

    function isZ(digit) {
        return digit === 90;
    }

    function loopFromEnd(array, action) {
        var index = array.length;
        while (index) {
            index = index - 1;
            action(index);
        }
    }

    function hashKey(object) {
        var key = isNotNullObject(object) ? getOrSetObjectHashKey(object) : object;
        return typeof (object) + ":" + key;
    }

    window.hashKey = hashKey;

    function getOrSetObjectHashKey(object) {
        if (isFunction(object.hashKey)) {
            return object.hashKey();
        }
        object.hashKey = window.nextUniqueId();
        return object.hashKey;
    };

    function isFunction(object) {
        return typeof (object) === "function";
    };

    window.isFunction = isFunction;

    function isArray(object) {
        return Array.isArray(object);
    };

    window.isArray = isArray;

    function isFunctionOrArray(object) {
        return isFunction(object) || isArray(object);
    };

    window.isFunctionOrArray = isFunctionOrArray;

    function isString(item) {
        return typeof item === "string";
    }

    window.isString = isString;

    function isObjectOrFunction(item) {
        return typeof item === "object" || typeof item === "function";
    }

    window.isObjectOrFunction = isObjectOrFunction;

    function isNotNullObject(object) {
        return typeof (object) === "object" && object !== null;
    };

    var noRusElement = {};

    function findRusElementInContainerChildren(containerElement) {
        if (!containerElement.querySelectorAll) {
            return noRusElement;
        }
        var rusElements = containerElement.querySelectorAll("[rus-app]");
        if (rusElements.length > 0) {
            return rusElements[0];
        }
        return noRusElement;
    }

    function findRusElementInContainer(containerElement) {
        var rusElement = document.getElementById("rus-app");
        if (rusElement) {
            return rusElement;
        }
        return findRusElementInContainerChildren(containerElement);
    }

    function rusModule(provide) {

        provide.provider("compile", compileProvider)
               .directive({ input: inputDirective });

        provide.provider("rootScope", rootScopeProvider);
    }

    var getModule;

    function createGetModuleFunction() {
        getModule = getOrAddProperty(rusular, "module", moduleFactory);
    }

    function exposeExternalApi() {
        extend(rusular, { 'extend': extend });

        createGetModuleFunction();

        rusular.module("rusLocale", [])
               .provider("locale", localeProvider);

        rusular.module("rus", ["rusLocale"], ["provide", rusModule]);
    }

    function bootstrap(rusElement) {

        var modulesToLoad = [];

        modulesToLoad.unshift(["provide", function (provide) {
            provide.value("rootElement", rusElement);
        }]);

        modulesToLoad.unshift("rus");

        var injector = createInjector(getModule, modulesToLoad);
    }

    function initialize(containerElement) {
        var rusElement = findRusElementInContainer(containerElement);
        if (rusElement) {
            bootstrap(rusQuery(rusElement));
        }
    }

    exposeExternalApi();

    rusQuery(document).ready(function () {
        initialize(document, bootstrap);
    });

})(window, document);