var fs = require('fs');

module.exports.extend = (function () {
  function ok(obj) {
    return typeof obj === "object" && obj !== null;
  }

  return function (/* objects */) {
    var target = arguments[0];

    if (ok(target)) {
      for (var i=1;i<arguments.length;i++) {
        var obj = arguments[i];

        if (ok(obj)) {
          Object.keys(obj).forEach(function (key) {
            target[key] = obj[key];
          });
        }
      }
    }

    return target;
  }
}());

module.exports.generator = function (alphabet, length) {
  return function () {
    var str = '';

    for (var i=0;i<length;i++) {
      str += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return str;
  }
}

module.exports.readJsonFileSync = function (path) {
  var ext = '.json';

  if (path.slice(0 - ext.length) !== ext) {
    path += ext;
  }

  return JSON.parse(fs.readFileSync(path));
}