(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

angular.module('formio.wizard', ['formio'])
  .directive('formioWizard', function () {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'formio-wizard.html',
      scope: {
        src: '=',
        storage: '=',
        submission: '=?'
      },
      link: function (scope, element) {
        scope.wizardLoaded = false;
        scope.wizardElement = angular.element('.formio-wizard', element);
      },
      controller: [
        '$scope',
        '$compile',
        '$element',
        'Formio',
        'FormioScope',
        'FormioUtils',
        function (
          $scope,
          $compile,
          $element,
          Formio,
          FormioScope,
          FormioUtils
        ) {
          var session = $scope.storage ? localStorage.getItem($scope.storage) : false;
          if (session) {
            session = angular.fromJson(session);
          }
          $scope.formio = new Formio($scope.src);
          $scope.page = {};
          $scope.form = {};
          $scope.pages = [];
          $scope.colclass = '';
          if (!$scope.submission || !Object.keys($scope.submission.data).length) {
            $scope.submission = session ? {data: session.data} : {data: {}};
          }
          $scope.currentPage = session ? session.page : 0;

          $scope.formioAlerts = [];
          // Shows the given alerts (single or array), and dismisses old alerts
          this.showAlerts = $scope.showAlerts = function (alerts) {
            $scope.formioAlerts = [].concat(alerts);
          };

          $scope.clear = function () {
            if ($scope.storage) {
              localStorage.setItem($scope.storage, '');
            }
            $scope.submission = {data: {}};
            $scope.currentPage = 0;
          };

          // Show the current page.
          var showPage = function () {

            // If the page is past the components length, try to clear first.
            if ($scope.currentPage >= $scope.form.components.length) {
              $scope.clear();
            }

            $scope.wizardLoaded = false;
            if ($scope.storage) {
              localStorage.setItem($scope.storage, angular.toJson({
                page: $scope.currentPage,
                data: $scope.submission.data
              }));
            }
            $scope.page.components = $scope.form.components[$scope.currentPage].components;
            var pageElement = angular.element(document.createElement('formio'));
            $scope.wizardElement.html($compile(pageElement.attr({
              src: "'" + $scope.src + "'",
              form: 'page',
              submission: 'submission',
              id: 'formio-wizard-form'
            }))($scope));
            $scope.wizardLoaded = true;
            $scope.formioAlerts = [];
            $scope.$emit('wizardPage', $scope.currentPage);
          };

          // Check for errors.
          $scope.checkErrors = function () {
            if (!$scope.isValid()) {
              // Change all of the fields to not be pristine.
              angular.forEach($element.find('[name="formioFieldForm"]').children(), function (element) {
                var elementScope = angular.element(element).scope();
                var fieldForm = elementScope.formioFieldForm;
                if (fieldForm[elementScope.component.key]) {
                  fieldForm[elementScope.component.key].$pristine = false;
                }
              });
              $scope.formioAlerts.push({
                type: 'danger',
                message: 'Please fix the following errors before proceeding.'
              })
              return true;
            }
            return false;
          };

          // Submit the submission.
          $scope.submit = function () {
            if ($scope.checkErrors()) {
              return;
            }
            var sub = angular.copy($scope.submission);
            FormioUtils.eachComponent($scope.form.components, function(component) {
              if (sub.data.hasOwnProperty(component.key) && (component.type === 'number')) {
                if (sub.data[component.key]) {
                  sub.data[component.key] = parseFloat(sub.data[component.key]);
                }
                else {
                  sub.data[component.key] = 0;
                }
              }
            });
            $scope.formio.saveSubmission(sub).then(function (submission) {
                if ($scope.storage) {
                  localStorage.setItem($scope.storage, '');
                }
                $scope.$emit('formSubmission', submission);
              })
              .catch(FormioScope.onError($scope, $element));
          };

          $scope.cancel = function () {
            $scope.clear();
            showPage();
          };

          // Move onto the next page.
          $scope.next = function () {
            if ($scope.checkErrors()) {
              return;
            }
            if ($scope.currentPage >= ($scope.form.components.length - 1)) {
              return;
            }
            $scope.currentPage++;
            showPage();
            $scope.$emit('wizardNext', $scope.currentPage);
          };

          // Move onto the previous page.
          $scope.prev = function () {
            if ($scope.currentPage < 1) {
              return;
            }
            $scope.currentPage--;
            showPage();
            $scope.$emit('wizardPrev', $scope.currentPage);
          };

          $scope.goto = function (page) {
            if (page < 0) {
              return;
            }
            if (page >= $scope.form.components.length) {
              return;
            }
            $scope.currentPage = page;
            showPage();
          };

          $scope.isValid = function () {
            var element = $element.find('#formio-wizard-form');
            if (!element.length) {
              return false;
            }
            var formioForm = element.children().scope().formioForm;
            return formioForm.$valid;
          };

          $scope.$on('wizardGoToPage', function (event, page) {
            $scope.goto(page);
          });

          // Load the form.
          $scope.formio.loadForm().then(function (form) {
            $scope.pages = [];
            angular.forEach(form.components, function(component) {

              // Only include panels for the pages.
              if (component.type === 'panel') {
                $scope.pages.push(component);
              }
            });

            $scope.form = form;
            $scope.form.components = $scope.pages;
            $scope.page = angular.copy(form);
            if ($scope.pages.length > 6) {
              $scope.margin = ((1 - ($scope.pages.length * 0.0833333333)) / 2) * 100;
              $scope.colclass = 'col-sm-1';
            }
            else {
              $scope.margin = ((1 - ($scope.pages.length * 0.1666666667)) / 2) * 100;
              $scope.colclass = 'col-sm-2';
            }

            $scope.$emit('wizardFormLoad', form);
            showPage();
          });
        }
      ]
    };
  }).run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio-wizard.html',
        "<div>\n    <div class=\"row bs-wizard\" style=\"border-bottom:0;\">\n        <div ng-class=\"{disabled: ($index > currentPage), active: ($index == currentPage), complete: ($index < currentPage)}\" class=\"{{ colclass }} bs-wizard-step\" ng-repeat=\"page in pages\">\n            <div class=\"text-center bs-wizard-stepnum\">{{ page.title }}</div>\n            <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n            <a ng-click=\"goto($index)\" class=\"bs-wizard-dot\"></a>\n        </div>\n    </div>\n    <style type=\"text/css\">.bs-wizard > .bs-wizard-step:first-child { margin-left: {{ margin }}%; }</style>\n    <i ng-show=\"!wizardLoaded\" id=\"formio-loading\" style=\"font-size: 2em;\" class=\"glyphicon glyphicon-refresh glyphicon-spin\"></i>\n    <div ng-repeat=\"alert in formioAlerts\" class=\"alert alert-{{ alert.type }}\" role=\"alert\">{{ alert.message }}</div>\n    <div class=\"formio-wizard\"></div>\n    <ul ng-show=\"wizardLoaded\" class=\"list-inline\">\n        <li><a class=\"btn btn-default\" ng-click=\"cancel()\">Cancel</a></li>\n        <li ng-if=\"currentPage > 0\"><a class=\"btn btn-primary\" ng-click=\"prev()\">Previous</a></li>\n        <li ng-if=\"currentPage < (form.components.length - 1)\">\n            <button class=\"btn btn-primary\" ng-click=\"next()\">Next</button>\n        </li>\n        <li ng-if=\"currentPage >= (form.components.length - 1)\">\n            <button class=\"btn btn-primary\" ng-click=\"submit()\">Submit Form</button>\n        </li>\n    </ul>\n</div>"
      );
    }
  ]);
},{}]},{},[1]);
