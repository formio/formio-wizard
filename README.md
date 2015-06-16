Installation
----------------
After you download this repository, you need to run the following command.

```
bower install;
```

Once you do this, you should then be able to change the form that is rendered
by changing the URL within the index.html page.

Dependencies
----------------
The dependencies are managed via Bower and auto implemented into ```index.html``` using wiredep.
You can auto include the dependencies by typing the following in the terminal.

```
npm install -g gulp;
npm install;
gulp wiredep;
```

Wizard Implementation
------------------
A wizard can be easily developed using Form.IO by triggering on the ```formSubmission``` event and then
loading the next pages of the form. The following code can be found within the ```index.html``` file.

```javascript
angular.module('formioForm', ['formio']).controller('WizardController', ['$scope', '$compile', function($scope, $compile) {

    // All your wizard pages can go here.
    var pages = [
      'https://wizard.form.io/app/api/page1',
      'https://wizard.form.io/app/api/page2',
      'https://wizard.form.io/app/api/page3'
    ];

    // Keep track of all the submissions.
    $scope.submissions = [];
    $scope.wizardDone = false;

    // Show the page at the following index.
    var showPage = function(index) {

      // Create the page.
      var page = angular.element(document.createElement('formio'));
      var attributes = {
        src: "'" + pages[index] + "'"
      };
      if ($scope.submissions.length > 0) {
        attributes.submission = angular.toJson({
          data: {previousSubmission: $scope.submissions[($scope.submissions.length - 1)]._id}
        });
      }

      // Assign the HTML to the wizard page.
      angular.element('#formio-wizard').html($compile(page.attr(attributes))($scope));
    };

    // Show the first page.
    showPage(0);

    // Trigger on the form submission event.
    $scope.$on('formSubmission', function(event, submission) {
      $scope.submissions.push(submission);
      if ($scope.submissions.length < pages.length) {
        showPage($scope.submissions.length);
      }
      else {
        $scope.wizardDone = true;
      }
    });
  }
]);
```
