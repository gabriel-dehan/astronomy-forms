App.Posts = new Mongo.Collection('posts');

App.Post = Astro.Class({
  name: 'Post',
  collection: App.Posts,
  behaviors: ['timestamp', 'softremove'],
  fields: {
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
