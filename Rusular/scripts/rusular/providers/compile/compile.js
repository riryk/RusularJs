
    function compile(nodes, transcludeFunc, maxPriority, ignoreDirective, previousCompileContext) {
        skipTopLevelTextElements(nodes);
        var compositeLinkFunc = compileNodes(nodes, transcludeFunc, nodes, maxPriority, ignoreDirective, previousCompileContext);

        return function publicLinkFunc(scope, cloneConnectFunc, transcludeControllers) {
            var linkNodes = nodes;
            for (var i = 0; i < linkNodes.length; i++) {
                if (linkNodes[i].nodeType === 1 || linkNodes[i].nodeType === 9) {
                    linkNodes.eq(i).data("$scope", scope);
                }
            }
            if (cloneConnectFunc) {
                cloneConnectFunc(linkNodes);
            }
            if (compositeLinkFunc) {
                compositeLinkFunc(scope, linkNodes, linkNodes);
            }
            return linkNodes;
        }

        function skipTopLevelTextElements(nodes) {
            forEach(nodes, function (node, index) {
                if (isNotEmptyTextNode(node)) {
                    nodes[index] = query(node).wrap("<span></span>").parent()[0];
                }
            });
        }

        function isNotEmptyTextNode(node) {
            return node.nodeType === 3 && node.nodeValue.match(/\S+/);
        }
    }
