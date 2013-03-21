var Mocha = require('mocha');
var path = require('path');
var fs = require('fs');

require('should');

var mocha = new Mocha({
  reporter: 'spec'
});

fs.readdirSync('test').filter(function (file) {
  return path.extname(file) === ".js";
}).forEach(function (file) {
  mocha.addFile(path.join('test', file));
});

mocha.run(function (failures) {
  process.exit(failures);
});