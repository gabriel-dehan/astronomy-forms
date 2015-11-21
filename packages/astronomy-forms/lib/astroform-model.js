/* - Model Mixin -
 *
 *   Dependencies: []
 */
ModelMixin = stampit()
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
