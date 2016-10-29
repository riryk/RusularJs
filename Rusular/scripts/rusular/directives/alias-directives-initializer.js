function AliasDirectivesInitializer() {
    var prefixRegexp = /^(x[\:\-_]|data[\:\-_])/i;
    var booleanAttributes = ["selected", "checked", "disabled", "readOnly", "required", "open"];
    var linkAttributes = ["src", "srcset", "href"];

    var rusAliasDirectives = {};

    function directiveNormalize(name) {
        return camelCase(name.replace(prefixRegexp, ""));
    }

    function createBooleanDirective(normalizedAttrName, attributeName) {
        return function () {
            return {
                priority: 100,
                link: function (scope, element, attr) {
                    scope.$watch(attr[normalizedAttrName], function (value) {
                        attr.$set(attributeName, !!value);
                    });
                }
            };
        };
    }

    function createLinkDirective(normalizedAttrName, attributeName) {
        return function () {
            return {
                priority: 99,
                link: function (scope, element, attr) {
                }
            };
        };
    }

    function initializeBooleanDirectives() {
        forEach(booleanAttributes, function (attributeName) {
            var normalizedAttrName = directiveNormalize("rus-" + attributeName);
            rusAliasDirectives[normalizedAttrName] = createBooleanDirective(normalizedAttrName, attributeName);
        });
    }

    function initializeLinkDirectives() {
        forEach(linkAttributes, function (attributeName) {
            var normalizedAttrName = directiveNormalize("rus-" + attributeName);
            rusAliasDirectives[normalizedAttrName] = createLinkDirective(normalizedAttrName, attributeName);
        });
    }

    return {
        getAliasDirectives: function() {
            initializeBooleanDirectives();
            initializeLinkDirectives();
            return rusAliasDirectives;
        }
    };
}






