App.Posts = new Mongo.Collection('posts');

App.Post = Astro.Class({
  name: 'Post',
  collection: App.Posts,
  behaviors: ['timestamp', 'softremove'],
  relations: {
    user: {
      type: 'one',
      class: 'User',
      local: 'user_id',
      foreign: '_id'
    }
  },
  fields: {
    user_id: {
      type: 'string',
      validator: [
        Validators.string(),
        Validators.required()
      ]
    },
    title: {
      type: 'string',
      validator: [
        Validators.string(),
        Validators.required(),
        Validators.minLength(3),
        Validators.maxLength(40)
      ]
    },
    content: 'string',
    publishedAt: 'date'
  }
});
