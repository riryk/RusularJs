function InheritedPropertyFinder(rusQuery) {
	function isDocument(element) {
		return element.nodeType === Node.DOCUMENT_NODE;
	}
	function isDocumentFragment(element) {
		return element.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
	}
	function parent(element) {
		return rusQuery(element[0].parentNode || (isDocumentFragment(element[0]) && element[0].host));
	}
	function toArray(propertyName) {
		return isArray(propertyName) ? propertyName : [propertyName];
	}
	function getElementPropertyValue(element, propertyNames) {
		var propertyValue;
		for (var i = 0; i < propertyNames.length; i++) {
			propertyValue = element.data(propertyNames[i]);
			if (propertyValue !== undefined) {
				return propertyValue;
			}
		}
		return null;
	}

	function findInheritedPropertyValue(elementHtml, propertyName) {
		var element = rusQuery(elementHtml);
		if (isDocument(elementHtml)) {
			element = element.find("html");
		}
		var propertyNames = isArray(propertyName) ? propertyName : [propertyName];
		while (element.length) {
			var propertyValue = getElementPropertyValue(element, propertyNames);
			if (propertyValue != null) {
				return propertyValue;
			}
			element = parent(element);
		}
		return null;
	}
}