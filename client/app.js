Template.App.helpers({
  post: function() { return App.Post.findOne(); }
});

Meteor.startup(function(){
  Meteor.loginWithPassword("demo", "password", function(error) {
    console.debug(error);
  });
});
