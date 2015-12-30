angular.module('formio.wizard', ['formio'])
    .directive('formioWizard', function() {
        return {
            restrict: 'E',
            replace: true,
            template:
            '<div>' +
                '<i ng-show="!wizardLoaded" id="formio-loading" style="font-size: 2em;" class="glyphicon glyphicon-refresh glyphicon-spin"></i>' +
                '<div ng-repeat="alert in formioAlerts" class="alert alert-{{ alert.type }}" role="alert">' +
                    '{{ alert.message }}' +
                '</div>' +
                '<div class="formio-wizard"></div>' +
                '<ul ng-show="wizardLoaded" class="list-inline">' +
                    '<li ng-if="currentPage > 0"><a class="btn btn-primary" ng-click="prev()">Previous</a></li>' +
                    '<li ng-if="currentPage < (form.components.length - 1)"><a class="btn btn-primary" ng-click="next()">Next</a></li>' +
                    '<li ng-if="currentPage >= (form.components.length - 1)"><a class="btn btn-primary" ng-click="submit()">Submit Form</a></li>' +
                '</ul>' +
            '</div>',
            scope: {
                src: '=',
                storage: '='
            },
            link: function(scope, element) {
                scope.wizardLoaded = false;
                scope.wizardElement = angular.element('.formio-wizard', element);
            },
            controller: [
                '$scope',
                '$compile',
                'Formio',
                function(
                    $scope,
                    $compile,
                    Formio
                ) {
                    var session = $scope.storage ? localStorage.getItem($scope.storage) : false;
                    if (session) {
                        session = angular.fromJson(session);
                    }
                    $scope.formio = new Formio($scope.src);
                    $scope.page = {};
                    $scope.form = {};
                    $scope.submission = {data: (session ? session.data : {})};
                    $scope.currentPage = session ? session.page : 0;

                    // Show the current page.
                    var showPage = function() {
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
                            submission: 'submission'
                        }))($scope));
                        $scope.wizardLoaded = true;
                        $scope.$emit('wizardPage', $scope.currentPage);
                    };

                    // Submit the submission.
                    $scope.submit = function() {
                        $scope.formio.saveSubmission(angular.copy($scope.submission)).then(function(submission) {
                            if ($scope.storage) {
                                localStorage.setItem($scope.storage, '');
                            }
                            $scope.$emit('formSubmission', submission);
                        });
                    };

                    // Move onto the next page.
                    $scope.next = function() {
                        if ($scope.currentPage >= ($scope.form.components.length - 1)) { return; }
                        $scope.currentPage++;
                        showPage();
                        $scope.$emit('wizardNext', $scope.currentPage);
                    };

                    // Move onto the previous page.
                    $scope.prev = function() {
                        if ($scope.currentPage < 1) { return; }
                        $scope.currentPage--;
                        showPage();
                        $scope.$emit('wizardPrev', $scope.currentPage);
                    };

                    $scope.goto = function(page) {
                        if (page < 0) { return; }
                        if (page >= $scope.form.components.length) { return; }
                        $scope.currentPage = page;
                        showPage();
                    };

                    $scope.$on('wizardGoToPage', function(event, page) {
                        $scope.goto(page);
                    });

                    // Load the form.
                    $scope.formio.loadForm().then(function(form) {
                        $scope.form = form;
                        $scope.page = angular.copy(form);
                        $scope.$emit('wizardFormLoad', form);
                        showPage();
                    });
                }
            ]
        };
    });