/* - Template Mixin -
 *
 *   Dependencies: [model]
 */
TemplateMixin = stampit()
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
  .compose(ModelMixin);
