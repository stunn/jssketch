define(['models/version', 'models/model'], function (Version, Model) {
  return new Model({
    properties: {
      id: {
        type: 'number',
        updateable: false,
        required: true
      },
      type: {
        type: 'string',
        updateable: false,
        required: true
      },
      name: {
        type: 'string',
        updateable: false,
        required: true
      },
      defaultVersion: {
        type: Version,
        updateable: true,
        required: true
      }
    },

    collections: {
      versions: {
        type: Version,
        validator: function (instance) {
          // Check the URL and ID of the versions are unique
          return !this.some(function (other) {
            return other.get('id') === instance.get('id') || other.get('url') === instance.get('url');
          });
        }
      }
    }
  });
});