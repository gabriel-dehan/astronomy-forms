/* - Form Mixin -
 *
 *   Dependencies: [template, model]
 */
FormMixin = stampit()
  .refs({
    hasRecord: function() {
      return !(_.isNull(this.record) || _.isUndefined(this.record));
    }
  })
  .init(function() {
    var self = this;

    // from usefulio:forms package
    Forms.mixin(this.template, { events: false });

    /* On template creation we set the record as an attribute of the form instance
     * and overrides a few methods of the usefulio/form object to work with astronomy schemas.
     * We also set the model, action and actionFunction if need be.
     */
    this.template.onCreated(function() {
      var instance = this;
      var templateData = this.data || {};
      var templateAction = templateData.action;
      var viewAction = self.action;

      this.form.model = self.getModel();
      this.form.hasRecord = self.hasRecord;

      this.form.showErrors = self.options.displayErrors || true;
      this.form.displayErrors = self.displayErrors; // function
      this.form.clearErrors = self.clearErrors; // function
      this.form.__submittedOnce = false;

      // If we are using an Astronomy Model we override the form's error handling to include the record
      if (this.form.hasRecord) {
        // form.validate() now validates the form and the record
        this.form.validate = _.wrap(this.form.validate, function(func, field) {
          if (field) {
            return func.call(instance.form, field);
          } else  {
            let validForm   = (func.call(instance.form) === true);
            let validRecord = instance.form.record.validate();

            return validForm && validRecord;
          }
        });

        // form.errors() now returns both form errors and record errors
        this.form.errors = _.wrap(this.form.errors, function(func, fieldOrErrors, errors) {
          let formErrors   = [];
          let recordErrors = instance.form.record.getValidationErrors() || []

          if (fieldOrErrors && errors) {
            formErrors  = func.call(instance.form, fieldOrErrors, errors) || [];
          } else if (fieldOrErrors) {
            formErrors  = func.call(instance.form, fieldOrErrors) || [];
          } else {
            formErrors  = func.call(instance.form) || [];
          }

          // We transform recordErrors in an array to stick to the usefulio/form way
          recordErrors = _.map(recordErrors, function(message, name) {
            return {name: name, error: new Error(), message: message};
          });

          return formErrors.concat(recordErrors);
        });
      } // If has record

      // Action is Custom or non given (template side)
      if (!(templateAction === 'create' || templateAction === 'update')) {
        // Action has to be custom if not create or update
        this.form.action = 'custom';
        self.action = this.form.action;

        // We set the actionFunction if need be
        if (_.isFunction(viewAction)) {
          this.form._actionFunc = self.action;
        } else {
          throw new ActionFunctionMissing();
        }
      }

      // We set the record if there is one
      if (_.contains(Object.keys(templateData), 'for')) {
        // We set the record onto the form object
        this.autorun(function() {
          instance.form.record = Template.currentData().for; // Once form has loaded
          self.record = instance.form.record; // Just set it on our Stampit Form

          if (self.record) {
            // Populate form.doc TODO: Refactor
            let doc = Tools.Record.toDoc(instance.form.record, instance.form.model);
            instance.form.doc(R.merge(doc, instance.form.doc));
          }
        });

        if (_.isUndefined(this.form._actionFunc) && this.form.action === 'custom') {
          throw new RecordOrActionMissing();
        }
      } else if ((viewAction === 'create' || templateAction === 'create') && this.form.model) {
        self.record = new this.form.model;
        instance.form.record = self.record;
        // Populate form.doc TODO: Refactor
        let doc = Tools.Record.toDoc(instance.form.record, instance.form.model);
        instance.form.doc(R.merge(doc, instance.form.doc));
      }

      // We check if we have at least a record or an action
      if ((_.isNull(this.form.action) || _.isUndefined(this.form.action))
          && (_.isNull(templateAction) || _.isUndefined(templateAction))
          && (_.isNull(this.form.record) || _.isUndefined(this.form.record))) {
            throw new RecordAndActionMissing();
          }

      // If the action was not set we infer the action. The precedence order is :
      // Form action (in js) > Template action (in html/jsx) > Template record (in html/jsx)
      /* We set the action
       * If we already have a custom action set on form  we keep it
       * If we don't but have a template action instead we keep it
       * If we have neither but we have a record we try to infer it
       */
      this.form.action = this.form.action || templateAction || (this.form.record._id ? 'create' : 'update')
    });


    // Define basic events
    this.template.events({
      // https://github.com/usefulio/forms/blob/50102f6f9c0526c41b68a022ac345f527d271ca3/lib/forms.js#L445
      'change input, change textarea, change select, keyup input:not(:checkbox):not(:radio), keyup textarea, blur input:not(:checkbox):not(:radio), blur textarea': function (e, tmpl) {
        var propertyName = e.currentTarget.name;
        if (propertyName && propertyName.length) {
          // XXX less invasive method of preventing this event from being handled
          // by multiple forms instances?
          e.stopPropagation();
          e.stopImmediatePropagation();
          var changes = {};
          changes[propertyName] = e.currentTarget.type === "checkbox" ? e.currentTarget.checked : e.currentTarget.value;
          $(e.currentTarget).trigger('propertyChange', changes);
        }
      },
      // Store the changes in the model
      'propertyChange': function(e, t, changes) {
        t.form.change(changes, e.currentTarget, e);

        let el    = $(e.currentTarget);
        let name  = el.attr('name');
        let value = null;

        if (el.is(':checkbox')) {
          value = el.is(':checked');
        } else if (el.is(':radio')) {
          value = t.$(`input[name=${name}]:checked`).val();
        } else { // text, select, textarea
          value = el.val();
        }

        if(t.form.model && t.form.record) {
          let fields = t.form.model.getFieldsNames();

          if (_.contains(fields, name)) {
            t.form.record[name] = value;
          } else {
            console.warn(`AstroForm::AttributeDoesNotExist: Trying to access attribute '${name}' on model ${t.form.model.getName()}, but it is nowhere to be found.`);
          }
        }

        // Display Errors
        if (t.form.showErrors === true || t.form.showErrors === "onPropertyChanged") {
          t.form.validate(); // We validate the form to get the errors
          t.form.displayErrors(e, t, changes);
        }
      },

      'submit': function (e, t) {
        let el = $(t.firstNode);
        el.trigger('beforeValidate');
        t.form.submit(e.currentTarget, e);
        el.trigger('afterValidate');
      },

      // documentSubmit is called when the form AND the record are valid
      'documentSubmit': function(e, t) {
        console.log('submit');
        return self.__actUponAction(true, e, t);
      },

      // Called when form, record or both are invalid
      'documentInvalid': function(e, t) {
        return self.__actUponAction(false, e, t);
      }
    });
  })
  .methods({
    /* Public: Basic error display
     *
     * Returns nothing.
     */
    displayErrors: function(e, t, changes) {
      let form = t.form;

      if (form.showErrors && form.__submittedOnce) {
        if (form.errors().length === 0) {
          form.clearErrors(t);
        }
        console.log('display errors', form.errors())
        _.each(form.errors(), function(error) {
          if (changes && _.contains(Object.keys(changes), error.name)) {
            t.$(`[name=${error.name}]`).addClass('has-error');
          } else if (!changes) {
            t.$(`[name=${error.name}]`).addClass('has-error');
          }
        });
      }
    },
    clearErrors: function(t) {
      t.$('.has-error').removeClass('has-error');
      // blah
    },
    /* Private: saves the record and do what is needed for a given action (create, update, custom).
     * Returns the return value of record.save() or the return value of the action function.
     */
    __actUponAction: function(documentValid, submitEvent, t) {
      let form    = t.form;
      console.log('Document valid ? ', documentValid, form.action, form.model, form.record);

      if (form.action === 'create' || form.action === 'update') {
        if (form.record && documentValid) {
          return form.record.save();
        } else {
          form.__submittedOnce = true; // Activate error display
          if (t.form.showErrors === true || t.form.showErrors === "afterSubmit") {
            form.displayErrors(submitEvent, t);
          }
        }
      } else if (form.action === 'custom') {
        return form._actionFunc.call(this, e, t, documentValid);
      }
    }
  });
