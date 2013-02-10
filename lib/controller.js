var express = require('express');

module.exports = function (client) {
  var instance = express();

  instance.set('views', __dirname + '/../views');

  return instance;
}