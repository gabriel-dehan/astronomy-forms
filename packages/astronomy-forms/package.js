Package.describe({
  name: 'diacred:astronomy-forms',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Astronomy forms ',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.2');
  api.use(['ecmascript', 'reactive-var', 'reactive-dict', 'check', 'blaze-html-templates', 'ui', 'underscore', 'jquery', 'random', 'ejson', 'tracker']);
  api.use('fourseven:scss');
  api.use('stampitorg:stampit');
  api.use('useful:forms@1.0.3');
  api.use('jagi:astronomy');
  api.use('jagi:astronomy-validators');


  api.imply('jagi:astronomy');

  api.addFiles('lib/astroform-utility.js');
  api.addFiles('lib/astroform-errors.js');
  api.addFiles('lib/astroform-model.js');
  api.addFiles('lib/astroform-template.js');
  api.addFiles('lib/astroform-form.js');
  api.addFiles('astro-form.js');

  api.export('AstroForm');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('diacred:astronomy-forms');
  api.addFiles('astronomy-forms-tests.js');
});
