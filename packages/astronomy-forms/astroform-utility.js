/*
 * De-stringifies an object keys chain
 * 'history.back' becomes `history.back`
 * 'analyses.0.content' becomes `analyses[0].content`
 *
 * Example:
 *
 *   AstroForm.Utility.chain(window, 'history.back');
 *
 *   Returns an object
 *   {
 *     chain: window.history.back // the method as a Function object
 *     context: window.history // the method's context
 *     get: func() // Returns the chain value if it is not a function
 *     call: func() // A Function that calls the method chain if it's a function
 *   }
 *
 *   You can then do : AstroForm.Utility.chain(window, 'history.back').call();
 */
// TODO: Improve, should not be able to do .call() on non method object, same with get
AstroForm = AstroForm || {};
AstroForm.Utility = {
  chain: function(base, chain) {
    var chainAry  = chain.split('.');
    var fullChain = base;
    var context   = base;
    var missingLink = false;

    _.each(chainAry, function(link, index) {
      // Handles numbers in the chain (i.e: analyses.0.time)
      var isNumericLink = /^\d+$/.test(link);
      if (isNumericLink) {
        link = parseFloat(link);
      }

      if (fullChain[link] && !missingLink) {
        // We set the context to the last evaluated link
        // Example : `window.history.back`, context will be `window.history`
        context = (index === chainAry.length - 1) ? fullChain : context;
        fullChain = fullChain[link];
      } else {
        missingLink = link;
      }
    });

    if (missingLink !== false) {
      return {
        chain: undefined,
        context: context,
        get: function() { return this.chain; },
        call: function() { throw new Meteor.Error(404, "Could not find: `." + chain + "`, " + missingLink + " is missing"); }
      }
    } else {
      return {
        chain: fullChain,
        context: context,
        get: function() { return this.chain; },
        call: function() { return this.chain.apply(this.context, arguments); }
      }
    };
  },
}
