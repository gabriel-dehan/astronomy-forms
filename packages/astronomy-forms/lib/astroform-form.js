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
      }

      // Action is Custom or non given (template side)
      if (templateAction !== 'create' || templateAction !== 'update') {
        // We set the actionFunction if need be
        if (viewAction && _.isFunction(viewAction)) {
          this.form.action = 'custom';
          this.form._actionFunc = self.action;
        } else if (templateAction === 'custom') {
          if (_.isFunction(self.action)) {
            self.action = 'custom';
            this.form._actionFunc = self.action;
          } else {
            throw new ActionFunctionMissing();
          }
        }
      }

      // We set the record if there is one
      if (_.contains(Object.keys(templateData), 'for')) {
        // We set the record onto the form object
        this.autorun(function() {
          instance.form.record = Template.currentData().for; // Once form has loaded
          self.record = instance.form.record; // Just set it on our Stampit Form
        });

        if (_.isUndefined(this.form._actionFunc)) {
          throw new RecordOrActionMissing();
        }
      } else if ((viewAction === 'create' || templateAction === 'create') && this.form.model) {
        self.record = new this.form.model;
        instance.form.record = self.record;
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

//        console.log(changes);
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
      },

      'submit': function (e, t) {
        let el = $(t.firstNode);
        el.trigger('beforeValidate');
        t.form.submit(e.currentTarget, e);
        el.trigger('afterValidate');
      },

      // documentSubmit is called when the form AND the record are valid
      'documentSubmit': function(e, t) {
        let form    = t.form;

        console.log('Valid', form.action);
        switch(form.action) {
        case 'create':
          // TODO: VALIDATE
          if (t.form.record) {
            debugger;
            return t.form.record.save();
          }
          console.log('Create', t.form.model, t.form.record);
          break;
        case 'update':
          // TODO: VALIDATE
          console.log('Update', t.form.model, t.form.record);
          break;
        case 'custom':
          console.log('Custom');
          // TODO: VALIDATE what does actionFunc returns ?
          return form._actionFunc.call(this, e, t);
          break;
        }
      },

      // Called when form, record or both are invalid
      'documentInvalid': function(e, t) {
        let form    = t.form;

        console.log('Invalid', form.action);
        switch(form.action) {
        case 'create':
          // TODO: VALIDATE
          if (t.form.record) {
          }
          console.log('Create', t.form.model, t.form.record);
          break;
        case 'update':
          // TODO: VALIDATE
          console.log('Update', t.form.model, t.form.record);
          break;
        case 'custom':
          console.log('Custom');
          // TODO: VALIDATE what does actionFunc returns ?
          isValid = form._actionFunc.call(this, e, t);
          break;
        }
      }
    });
  })
  .methods({
  });
