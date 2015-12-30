Form.io Wizard
---------------------
An Angular.js directive that provides wizard capabilities to a [Form.io](https://form.io) form using the following simple directive.

```
<formio-wizard src="'https://wizard.form.io/wizard'"></formio-wizard>
```

This directive uses Panel components placed within the root of your form as an indication for separate pages within
the wizard.

Getting Started
===================
You will first need to create an account at https://form.io. Go there now and sign up for a free account.

Installation
====================
To install this within your application, you will need to use bower.

```
bower install formio-wizard --save
```

Then, you will need to add the wizard and its dependencies to your HTML page.

```
<script src="bower_components/jquery/dist/jquery.js"></script>
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/ng-file-upload/ng-file-upload.js"></script>
<script src="bower_components/angular-sanitize/angular-sanitize.js"></script>
<script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.js"></script>
<script src="bower_components/moment/moment.js"></script>
<script src="bower_components/angular-moment/angular-moment.js"></script>
<script src="bower_components/ui-select/dist/select.js"></script>
<script src="bower_components/bootstrap/dist/js/bootstrap.js"></script>
<script src="bower_components/bootstrap-ui-datetime-picker/dist/datetime-picker.min.js"></script>
<script src="bower_components/signature_pad/signature_pad.js"></script>
<script src="bower_components/angular-ui-mask/dist/mask.js"></script>
<script src="bower_components/formio/dist/formio.js"></script>
<script src="bower_components/formio-wizard/dist/wizard.js"></script>
```

Now, you will need to add this to your Angular.js module as a dependency like the following.

```
angular.module('myApp', ['formio.wizard']);
```

Example
================
Take a look at **index.html** for an example implementation of this wizard capability.

How it works
================
This directive uses **Panel** components placed within the root of the form as the separate pages within that form. Because
of this, you will need to create your form using Panels on the root level to indicate separate pages like the following
image shows.

![](https://raw.githubusercontent.com/formio/formio-wizard/master/formio-wizard-form.png)
