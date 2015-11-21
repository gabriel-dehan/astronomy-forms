AstroForm = AstroForm || {}

// TODO: CAREFUL REFS ARE REFERENCES SHARED FOR EACH INSTANCE, PROPS ARE DUPLICATED FOR EACH INSTANCE

AstroForm.create = (function(templateName, options) {
  console.log(TemplateMixin, FormMixin);
  Form = stampit.compose(TemplateMixin, FormMixin);
  // Calls the factory function, creates a new instance of Form
  return Form({ templateName: templateName, options: options });
});

/*
   - Create
     - With nested
   - Update
     - With nested
   - Custom
*/
