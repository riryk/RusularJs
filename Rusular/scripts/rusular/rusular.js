
(function (window, document) {
    "use strict";

    if (window.rusular) {
        throw new Error("Rusular already initialized");
    }

    window.rusular = {};

    if (!window.jQuery) {
        throw new Error("JQuery is not defined");
    }

    window.rusQuery = window.jQuery;;

    function forEach(object, iterator, context) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                iterator.call(context, property, object[property]);
            }
        }
    }

    window.forEach = forEach;

    function addPropertyToObjectAndReturn(object, propertyName, propertyValueFactory) {
        return object[propertyName] || (object[propertyName] = propertyValueFactory());
    }

    window.addPropertyToObjectAndReturn = addPropertyToObjectAndReturn;

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
        provide.provider({ rootScope: rootScopeProvider });
    }

    function setupModuleLoader() {
        addPropertyToObjectAndReturn(rusular, "module", moduleFactory);
    }

    function exposeExternalApi() {
        extend(rusular, { 'extend': extend });

        setupModuleLoader();

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

        var injector = createInjector(modulesToLoad);
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