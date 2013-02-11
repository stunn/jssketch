var Model = require('./model');

module.exports.init = function (Revision) {
 return new Model({
    properties: {
      id: {
        type: "string",
        updateable: false
      }
    }
  });
};