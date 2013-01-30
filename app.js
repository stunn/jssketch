var express = require('express');
var jssketch = require('./vendor/jssketch');
var app = express();
var client = jssketch({
  storage: new jssketch.MemoryStorage()
});

app.use(express.bodyParser());

function render(sketch, res) {
  res.render('index.ejs', {
    sketch: sketch,
    doctypes: client.doctypes
  });
  res.end();
}

app.param('id', function (req, res, next, id) {
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

app.get('/', function (req, res) {
  var sketch = new client.Sketch();

  sketch.revisions.add(new client.Revision());
  render(sketch, res);
});

/**
 * Saves a new revision of a sketch. There are 3 general scenario here:
 * 
 * 1. This is the first time a sketch has been saved. A sketch needs to be created, and a new revision added.
 * 2. This is an update of a sketch. The sketch needs to be loaded, and a new revision added.
 * 3. This should be a fork of a sketch. A new sketch needs to be created and a new revision added.
 */
app.post('/save', function (req, res, next) {
  function withSketch(sketch) {
    var revision = new client.Revision();

    revision.update(req.body);
    sketch.revisions.add(revision);

    client.save(sketch, function (err) {
      if (!err) {
        res.redirect('/' + sketch.id + '/' + revision.id);
      }
    });
  }

  // This first case handles (2); e.g. the loading of an existing sketch and addition of a new revision
  if (typeof req.body.id === "string" && req.body.id.length > 0 && req.body.save === "update") {
    client.load(req.body.id, function (err, sketch) {
      if (!err) {
        withSketch(sketch);
      } else {
        next();
      }
    });

  // In all other situations, we want to add a revision to a newly created sketch
  } else {
    withSketch(new client.Sketch());
  }
});

app.post('/render', function (req, res) {
  var sketch = new client.Sketch();
  var revision = new client.Revision();
  
  revision.update(req.body);
  sketch.revisions.add(revision);

  res.render('render.ejs', {
    sketch: sketch,
    doctypes: client.doctypes
  });
});

app.get('/:id/:rev?', function (req, res, next) {
  var rev = parseInt(req.params.rev, 10) || 1;
  var sketch = req.sketch;

  if (sketch && sketch.revisions.id(rev)) {
    render(req.sketch, res);
  } else {
    next();
  }
});

app.use(express.static(__dirname + '/public'));
app.listen(3000);