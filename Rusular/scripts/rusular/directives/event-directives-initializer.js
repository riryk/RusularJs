function EventDirectivesInitializer() {
    var prefixRegexp = /^(x[\:\-_]|data[\:\-_])/i;
    var eventAttributes = ["click", "dblclick", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mouseenter", "mouseleave", "keydown", "keyup", "keypress", "submit", "focus", "blur", "copy", "cut", "paste"];
    var eventDirectives = {};

    function directiveNormalize(name) {
        return camelCase(name.replace(prefixRegexp, ""));
    }

    function createEventDirective(directiveName, eventName) {
        return function () {
            function subscribeToEvent(scope, element, eventName, eventHandler) {
                element.on(lowercase(eventName), function (event) {
                    scope.$apply(function () {
                        eventHandler(scope, { $event: event });
                    });
                });
            }

            return {
                compile: function ($element, attr) {
                    var eventHandlerFunction = $parse(attr[directiveName]);
                    return function (scope, element) {
                        subscribeToEvent(scope, element, eventName, eventHandlerFunction);
                    };
                }
            };
        };
    }

    function initializeEventDirectives() {
        forEach(eventAttributes, function (attributeName) {
            var normalizedAttrName = directiveNormalize("rus-" + attributeName);
            eventDirectives[normalizedAttrName] = createEventDirective(normalizedAttrName, attributeName);
        });
    }

    return {
        getEventDirectives: function () {
            initializeEventDirectives();
            return eventDirectives;
        }
    };
}

