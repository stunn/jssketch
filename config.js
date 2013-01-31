var utils = require('utils');
var config = utils.readJsonFileSync(__dirname + '/config/config.json');
var defaults = {
  base: '127.0.0.1',
  jail: '127.0.0.1',
  port: 3000
};

module.exports = utils.extend(defaults, config);