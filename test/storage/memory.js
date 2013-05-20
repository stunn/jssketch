// Memory is the default config; no need to specify additional
var app = require('../support/app').create();

describe('Memory Storage', function () {
  require('../support/storage').run(app);
});