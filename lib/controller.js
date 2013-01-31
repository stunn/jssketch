var express = require('express');

module.exports = function (client) {
  var instance = express();

  instance.param('id', function (req, res, next, id) {
    if (/^[0-9a-zA-Z]{5}$/.test(id)) {
      client.load(id, function (err, sketch) {
        if (!err) {
          req.sketch = sketch;
        }

        next();
      });
    } else {
      next();
    }
  });

  instance.param('rev', function (req, res, next, rev) {
    if (req.sketch) {
      rev = parseInt(rev, 10);

      if (isFinite(rev)) {
        var revision = req.sketch.revisions.id(rev);

        if (revision) {
          req.revision = revision;
        }
      }
    }

    next();
  });

  instance.set('views', __dirname + '/../views');

  return instance;
}