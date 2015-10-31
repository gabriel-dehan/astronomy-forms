AstroForm = AstroForm || {}

/* - Errors - */
const TemplateNotFound = function(templateName) {
  this.name = "AstroForm::TemplateNotFound";
  this.message = `AstroForm could not find the template: ${templateName}.`;
}
TemplateNotFound.prototype = Error.prototype;

const RecordOrActionMissing = function() {
  this.name = "AstroForm::RecordOrActionMissing";
  this.message = "AstroForm could not find any record, if you don't plan on passing one, you need to pass a custom function to this form's action";
}
RecordOrActionMissing.prototype = Error.prototype;

const RecordAndActionMissing = function() {
  this.name = "AstroForm::RecordAndActionMissing";
  this.message = "AstroForm could not find any record nor action, if you don't plan on passing a record, you need to pass in an action and a model or a custom action function.";
}
RecordAndActionMissing.prototype = Error.prototype;

const ActionFunctionMissing = function() {
  this.name = "AstroForm::ActionFunctionMissing";
  this.message = "AstroForm could not find any action function. You specified a custom action type on the template but did not provide an action function in your view.";
}
ActionFunctionMissing.prototype = Error.prototype;


// TODO: CAREFUL REFS ARE REFERENCES SHARED FOR EACH INSTANCE, PROPS ARE DUPLICATED FOR EACH INSTANCE
/* - Model Mixin -
 *
 *   Dependencies: []
 */
var model = stampit()
  .refs({
    modelName: null,
    action: null
  })
  .init(function() {
    this.modelName = this.options.model;
    this.action = this.options.action;
  })
  .methods({
    getModel: function() {
      return AstroForm.Utility.chain(window, this.modelName).get();
    }
  });

/* - Template Mixin -
 *
 *   Dependencies: [model]
 */
var template = stampit()
  .refs({
    templateName: null
  })
  .init(function(options) {
    var self = this;

    this.template = Template[this.templateName];

    if (_.isUndefined(this.template)) {
      throw new TemplateNotFound(this.templateName);
    }
  })
  .methods({
    helpers(helpersMap) {
      this.template.helpers(helpersMap);
      return this;
    },
    events(eventsMap) {
      this.template.events(eventsMap);
      return this;
    },
    hooks(hooksMap) {
      var self = this;
      _.each(hooksMap, function(callback, hook, map) {
        self.template[hook](callback);
      });
      return this;
    }
  })
  .compose(model);

/* - Model Mixin -
 *
 *   Dependencies: [template, model]
 */
var form = stampit()
  .refs({
    hasRecord: function() {
      return !(_.isNull(this.record) || _.isUndefined(this.record));
    }
  })
  .init(function() {
    var self = this;

    Forms.mixin(this.template);

    /* On template creation we set the record as an attribute of the form instance
     * We also set the model, action and actionFunction if need be.
     */
    this.template.onCreated(function() {
      var instance = this;
      var templateData = this.data || {};
      var templateAction = templateData.action;
      var viewAction = self.action;

      this.form.model = self.getModel();
      this.form.hasRecord = self.hasRecord;

      // Custom or non given action template side
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
          instance.form.record = Template.currentData().for;
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

      /* We set the action
       * If we already have a custom action set on form  we keep it
       * If we don't but have a template action instead we keep it
       * If we have neither but we have a record we try to infer it
       */
      this.form.action = this.form.action || templateAction || (this.form.record._id ? 'create' : 'update')
    });


    // Define basic events
    this.template.events({
      // Store the changes in the model
      'keyup input:not(:checkbox):not(:radio), keyup textarea, change input, change textarea, blur input:not(:checkbox):not(:radio), blur textarea, click input[type=checkbox], click input[type=radio]': function(e, t) {
        console.log('change', e.type);
        let el    = $(e.currentTarget);
        let value = null;

        if (el.is(':checkbox')) {
          value = el.is(':checked');
        } else if (el.is(':radio')) {
          let name = el.attr('name');
          value = t.$(`input[name=${name}]:checked`).val();
        } else { // text, select, textarea
          value = el.val();
        }
        console.log(t.form, el.attr('name'), value);
      },
      // On submit
      'documentSubmit': function(e, t) {
        let el     = $(t.firstNode);

        el.trigger('beforeValidate');

        switch(t.form.action) {
        case 'create':
          // TODO: VALIDATE
          console.log('Create', t.form.model, t.form.record);
          break;
        case 'update':
          // TODO: VALIDATE
          console.log('Update', t.form.model, t.form.record);
          break;
        case 'custom':
          console.log('Custom');
          // TODO: VALIDATE what does actionFunc returns ?
          t.form._actionFunc.call(this, e, t);
          break;
        }

        el.trigger('afterValidate');
      }
    });
  })
  .methods({

  });


AstroForm.create = (function(templateName, options) {
  Form = stampit.compose(template, form);
  return Form({ templateName: templateName, options: options });
});

/*
   - Create
     - With nested
   - Update
     - With nested
   - Custom
*/
