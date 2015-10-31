UserProfile = Astro.Class({
  name: 'UserProfile',
  fields: {
    nickname: 'string'
    /* Any other fields you want to be published to the client */
  }
});

App.User = Astro.Class({
  name: 'User',
  collection: Meteor.users,
  fields: {
    createdAt: 'date',
    emails: {
      type: 'array',
      default: function() {
        return [];
      }
    },
    profile: {
      type: 'object',
      nested: 'UserProfile',
      default: function() {
        return {};
      }
    }
  }
});

if (Meteor.isServer) {
  App.User.extend({
    fields: {
      services: 'object'
    }
  });
}
