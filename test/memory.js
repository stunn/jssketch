// Memory is the default config; no need to specify additional
var app = require('./support/app').create();

require('./support/storage').run(app);