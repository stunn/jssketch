var Model = require('../models/model');

module.exports = new Model({
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