var app = require('../../lib/app');
var utils = require('utils');

module.exports.create = function (config, combine) {
  var fallback  = 'default';

  if (arguments.length === 0) {
    config = fallback;
  } else  if (arguments.length === 1) {
    combine = true;
  }

  if (typeof config === 'string') {
    config = require('../config/' + config);
  }

  if (combine) {
    config = utils.merge({}, require('../config/' + fallback), config);
  }

  return app(config);
};