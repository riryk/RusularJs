
var inputDirective = ["$browser", "$sniffer", function ($browser, $sniffer) {
    return {
        restrict: "E",
        require: "?ngModel",
        link: function (scope, element, attr, ctrl) {
            if (ctrl) {
                (inputType[lowercase(attr.type)] || inputType.text)(scope, element, attr, ctrl, $sniffer,
                                                                    $browser);
            }
        }
    };
}];


