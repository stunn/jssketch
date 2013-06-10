define(['models/model'], function (Model) {
  return new Model({
    properties: {
      id: {
        type: 'string',
        updateable: false,
        required: false
      },
      payload: {
        type: 'string',
        fallback: '',
        required: true,
        updateable: true
      },
      type: {
        type: 'string',
        required: true,
        updateable: true,
        validator: function (val) {
          if (['json', 'xml', 'html'].indexOf(val) === -1) {
            return 'Invalid type specified';
          }

          return true;
        }
      }
    }
  });
});