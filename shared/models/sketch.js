var Model = require('./model');

module.exports = new Model({
  properties: {
    id: {
      type: 'string',
      updateable: false
    }
  }
});
