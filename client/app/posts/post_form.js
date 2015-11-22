console.log('Hello');

PostForm = AstroForm.create('PostForm', {
  model: 'App.Post',
  displayErrors: true, // onPropertyChanged || afterSubmit || false || true (default)
  //action: 'create',
  /*action: function(event, template, isDocumentValid) {
  }*/
});

PostForm.helpers({
  showMustache: function() {
    console.log(this, Template.instance().form);
    console.log('Has record', Template.instance().form.hasRecord());
    return ":{{";
  }
});

PostForm.events({
  'beforeValidate': function(e, t) {
    console.log('beforeValidate called', this, t.form);
    // t.form.action === "update"
  },
  'afterValidate': function(e, t) {
    console.log('afterValidate called', this, t.form, t.form.errors());
    // t.form.action === "create"
  }
});

PostForm.hooks({
  onCreated: function() {
    console.log('onCreated', this); // => template instance
  }
});

// PostForm.methods({
//   giveMeTheRecord: function(a, b) {
//     console.log(this, a, b);
//   }
// });
