
var inputType = {
    "text": textInputType,
    "number": numberInputType,
    "url": urlInputType,
    "email": emailInputType,
    "radio": radioInputType,
    "checkbox": checkboxInputType,
    "hidden": noop,
    "button": noop,
    "submit": noop,
    "reset": noop,
    "file": noop
}

function textInputType(scope, element, attr, ctrl, $sniffer, $browser) {
    var composing = false;

    element.on('compositionstart', function (data) {
        composing = true;
    });

    element.on('compositionend', function () {
        composing = false;
        listener();
    });

    var listener = function () {
        var value = element.val();
        if (toBoolean(attr.ngTrim || 'T')) {
            value = trim(value);
        }
        if (ctrl.$viewValue !== value) {
            scope.$apply(function () {
                ctrl.$setViewValue(value);
            });
        }
    };

    if ($sniffer.hasEvent('input')) {
        element.on('input', listener);
    }

    element.on('change', listener);

    ctrl.$render = function () {
        element.val(ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue);
    };


}