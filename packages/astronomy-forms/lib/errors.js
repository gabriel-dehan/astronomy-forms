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
