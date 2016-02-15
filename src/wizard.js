angular.module('formio.wizard', ['formio'])
  .directive('formioWizard', function () {
    return {
      restrict: 'E',
      replace: true,
      template: '<div>' +
      '<i ng-show="!wizardLoaded" id="formio-loading" style="font-size: 2em;" class="glyphicon glyphicon-refresh glyphicon-spin"></i>' +
      '<div ng-repeat="alert in formioAlerts" class="alert alert-{{ alert.type }}" role="alert">' +
      '{{ alert.message }}' +
      '</div>' +
      '<div class="formio-wizard"></div>' +
      '<ul ng-show="wizardLoaded" class="list-inline">' +
      '<li><a class="btn btn-default" ng-click="cancel()">Cancel</a></li>' +
      '<li ng-if="currentPage > 0"><a class="btn btn-primary" ng-click="prev()">Previous</a></li>' +
      '<li ng-if="currentPage < (form.components.length - 1)"><button class="btn btn-primary" ng-click="next()">Next</button></li>' +
      '<li ng-if="currentPage >= (form.components.length - 1)"><button class="btn btn-primary" ng-click="submit()">Submit Form</button></li>' +
      '</ul>' +
      '</div>',
      scope: {
        src: '=',
        storage: '=',
        submission: '='
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
        function ($scope,
                  $compile,
                  $element,
                  Formio,
                  FormioScope) {
          var session = $scope.storage ? localStorage.getItem($scope.storage) : false;
          if (session) {
            session = angular.fromJson(session);
          }
          $scope.formio = new Formio($scope.src);
          $scope.page = {};
          $scope.form = {};
          if (!$scope.submission && session) {
            $scope.submission = {data: session.data};
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
            $scope.formio.saveSubmission(angular.copy($scope.submission)).then(function (submission) {
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
            $scope.form = form;
            $scope.page = angular.copy(form);
            $scope.$emit('wizardFormLoad', form);
            showPage();
          });
        }
      ]
    };
  });