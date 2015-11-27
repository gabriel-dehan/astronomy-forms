Meteor.startup(function(){
  // Create a demo user
  if (Meteor.users.find().count() === 0) {
    a = Accounts.createUser({'username': 'demo', 'email': "email@email.com", 'password': 'password'});
  }
});
