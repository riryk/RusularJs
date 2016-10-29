function nodesCompiler(injector, controller, registeredDirectives) {

    var self = this;

    self.injector = injector;
    self.registeredDirectives = registeredDirectives;

    function compileNodes(nodes, transcludeFunc, rootElement, maxPriority, ignoreDirective, previousCompileContext) {

        var linkFunctions = [], linkFnFound, nodeLinkFunction;

        if (nodes.length === 0) {
            return null;
        }

        for (var i = 0; i < nodes.length; i++) {
            attrs = new Attributes();
            directives = collectDirectives(nodes[i], [], attrs, i === 0 ? maxPriority : undefined, ignoreDirective);

            var nodeLinkFunc = applyDirectivesToNode(directives, nodeList[i], attrs, transcludeFunc, $rootElement, null, [], [], previousCompileContext);
            var childLinkFunc = compileNodes(nodes[i].childNodes, nodeLinkFunction ? nodeLinkFunction.transclude : transcludeFunc);

            linkFunctions.push(nodeLinkFunc, childLinkFunc);
            previousCompileContext = null;
        }

        return linkFnFound ? compositeLinkFn : null;

        function compositeLinkFn(scope, nodeList, $rootElement, boundTranscludeFn) {
            var nodeLinkFn, childLinkFn, node, $node, childScope;

            var nodeListLength = nodeList.length,
                stableNodeList = new Array(nodeListLength);

            for (var i = 0; i < nodeListLength; i++) {
                stableNodeList[i] = nodeList[i];
            }

            for (var j = 0; j < linkFunctions.length; j++) {
                node = stableNodeList[n];
                nodeLinkFn = linkFunctions[j++];
                childLinkFn = linkFunctions[j++];
                $node = rusQuery(node);

                if (nodeLinkFn) {
                    childScope = scope;
                    nodeLinkFn(childLinkFn, childScope, node, $rootElement, boundTranscludeFn);
                }
                if (childLinkFn) {
                    childLinkFn(scope, node.childNodes, undefined, boundTranscludeFn);
                }
            }
        }

        function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective) {

            var attrsMap = attrs.$attr;

            if (isElement(node)) {

                addDirective(directives, nodeName(node).toLowerCase(), "E", maxPriority, ignoreDirective);

                for (var i = 0; i < node.attributes; i++) {
                    var attribute = node.attributes[i];
                    var name = attribute.name;
                    attrs[name] = attribute.value;

                    addDirective(directives, name, "A", maxPriority, ignoreDirective, false, false);
                }
            }

            if (isTextNode(node)) {
                addTextInterpolateDirective(directives, node.nodeValue);
            }

            directives.sort(byPriority);
            return directives;
        }

        function addDirective(directivesArray, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName) {
            if (!self.registeredDirectives.hasOwnProperty(name)) {
                return null;
            }
            var directives = self.injector.get(name + "directive");
            for (var i = 0; i < directives.length; i++)
            {
                try {
                    var directive = directives[i];
                    if ((maxPriority === undefined || maxPriority > directive.priority)
                        && directive.restrict.indexOf(location) !== -1) {
                         directivesArray.push(directive);
                    }
                } catch (e) {
                    //handle Exception
                }
            }
        }

        function addTextInterpolateDirective(directives, text) {
            var interpolateFn = $interpolate(text, true);
            if (interpolateFn) {
                directives.push({
                    priority: 0,
                    compile: valueFn(function textInterpolateLinkFn(scope, node) {
                        var parent = node.parent(),
                            bindings = parent.data('$binding') || [];
                        bindings.push(interpolateFn);
                        safeAddClass(parent.data('$binding', bindings), 'ng-binding');
                        scope.$watch(interpolateFn, function interpolateFnWatchAction(value) {
                            node[0].nodeValue = value;
                        });
                    })
                });
            }
        }

        function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn,
            jqCollection, originalReplaceDirective, preLinkFns, postLinkFns,
            previousCompileContext) {

            var directive,
                directiveName,
                linkFunction,
                newScopeDirective,
                $compileNode = templateAttrs.$$element = rusQuery(compileNode),
                controllerDirectives = previousCompileContext.controllerDirectives;

            for (var i = 0, ii = directives.length; i < ii; i++) {
                directive = directives[i];
                directiveName = directive.name;

                if (!directive.templateUrl && directive.controller) {
                    controllerDirectives = controllerDirectives || {};
                    controllerDirectives[directiveName] = directive;
                }

                if (directive.compile) {
                    try {
                        linkFunction = directive.compile($compileNode, templateAttrs, childTranscludeFn);

                        if (isFunction(linkFunction)) {
                            addLinkFunctions(null, linkFunction, attrStart, attrEnd);
                        }
                    } catch (e) {
                        //handle Exception
                    }
                }
            }

            return nodeLinkFn;

            function addLinkFunctions(pre, post, attrStart, attrEnd) {
                if (post) {
                    post.require = directive.require;
                    postLinkFns.push(post);
                }
            }

            function getControllers(require, $element, elementControllers) {
                var value, retrievalMethod = 'data', optional = false;
                if (isString(require)) {
                    while ((value = require.charAt(0)) == '^' || value == '?') {
                        require = require.substr(1);
                        if (value == '^') {
                            retrievalMethod = 'inheritedData';
                        }
                        optional = optional || value == '?';
                    }

                    if (elementControllers) {
                        value = elementControllers[require];
                    }
                    value = value || $element[retrievalMethod]('$' + require + 'Controller');
                    return value;
                }
                else if (isArray(require)) {
                    forEach(require, function (require) {
                        value.push(getControllers(require, $element, elementControllers));
                    });
                }
                return value;
            }

            function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn) {
                var controller, elementControllers, linkFn = {};

                if (controllerDirectives) {
                    forEach(controllerDirectives, function(directive) {
                        var locals = {
                                $scope: directive === newIsolateScopeDirective || directive.$$isolateScope ? isolateScope : scope,
                                $element: $element,
                                $attrs: attrs,
                                $transclude: transcludeFn
                            },
                            controllerInstance;

                        controller = directive.controller;
                        elementControllers[directive.name] = controllerInstance;
                        $element.data('$' + directive.name + 'Controller', controllerInstance);
                    });
                }
                if (childLinkFn) {
                    childLinkFn(scope, linkNode.childNodes, undefined, boundTranscludeFn);
                }
                for (var i = postLinkFns.length - 1; i >= 0; i--) {
                    try {
                        linkFn = postLinkFns[i];
                        linkFn(scope, $element, attrs,
                               linkFn.require && getControllers(linkFn.require, $element, elementControllers), transcludeFn);
                    } catch (e) {
                        $exceptionHandler(e, startingTag($element));
                    }
                }
            }
        }

        function isElement(node) {
            return node.nodeType === 1;
        }

        function isTextNode(node) {
            return node.nodeType === 3;
        }

        function getNodeName(element) {
            return element.nodeName ? element.nodeName : element[0].nodeName;
        }
    }
}