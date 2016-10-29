
var rusModelDirective = function () {
    return {
        require: ["ngModel", "^?form"],
        controller: RusModelController,
        link: function (scope, element, attr, ctrls) {

            var modelCtrl = ctrls[0],
                formCtrl = ctrls[1] || nullFormCtrl;

            formCtrl.$addControl(modelCtrl);

            scope.$on("$destroy", function () {
                formCtrl.$removeControl(modelCtrl);
            });
        }
    };
};