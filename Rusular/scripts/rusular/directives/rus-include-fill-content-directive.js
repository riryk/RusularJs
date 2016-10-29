
var rusIncludeFillContentDirective = ["$compile",
      function ($compile) {
          return {
              restrict: "ECA",
              priority: -400,
              require: "rusInclude",
              link: function (scope, $element, $attr, ctrl) {
                  $element.html(ctrl.template);
                  $compile($element.contents())(scope);
              }
          };
      }];