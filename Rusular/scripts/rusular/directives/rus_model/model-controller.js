var RusModelController = [
    '$scope', '$exceptionHandler', '$attrs', '$element', '$parse', '$animate',
    function ($scope, $exceptionHandler, $attr, $element, $parse, $animate) {

        this.$viewValue = Number.NaN;
        this.$modelValue = Number.NaN;

        var ngModelGet = $parse($attr.ngModel),
            ngModelSet = ngModelGet.assign;

        var ctrl = this;

        this.$setViewValue = function(value) {
            this.$viewValue = value;

            // change to dirty
            if (this.$pristine) {
                this.$dirty = true;
                this.$pristine = false;
                $animate.removeClass($element, PRISTINE_CLASS);
                $animate.addClass($element, DIRTY_CLASS);
                parentForm.$setDirty();
            }

            if (this.$modelValue !== value) {
                this.$modelValue = value;
                ngModelSet($scope, value);

            }
        }

        $scope.$watch(function ngModelWatch() {
            var value = ngModelGet($scope);

            if (ctrl.$modelValue !== value) {
                ctrl.$modelValue = value;
            }

            if (ctrl.$viewValue !== value) {
                ctrl.$viewValue = value;
                ctrl.$render();
            }
        });
    }
];