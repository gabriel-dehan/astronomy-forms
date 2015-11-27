App.Tags = new Mongo.Collection('tags');

App.Tag = Astro.Class({
  name: 'Tag',
  collection: App.Tags,
  behaviors: ['timestamp', 'softremove'],
  relations: {
    post: {
      type: 'one',
      class: 'Post',
      local: 'post_id',
      foreign: '_id'
    }
  },
  fields: {
    post_id: {
      type: 'string',
      validator: [
        Validators.string(),
        Validators.required()
      ]
    },
    label: {
      type: 'string',
      validator: [
        Validators.string(),
        Validators.required(),
        Validators.minLength(3),
        Validators.maxLength(40)
      ]
    },
    createdAt: 'date'
  }
});
