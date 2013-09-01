define(['models/model'], function (Model) {
  return new Model({
    properties: {
      id: {
        type: 'string',
        updateable: false,
        required: true
      },

      detachable: {
        type: 'boolean',
        required: true
      },

      template: {}
    }
  });
});
