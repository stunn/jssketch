var express = require('express');
var jssketch = require('./vendor/jssketch');
var app = express();
var client = jssketch({
  storage: new jssketch.MemoryStorage()
});

app.use(express.bodyParser());

function render(sketch, res) {
  console.log(JSON.stringify(client.doctypes));

  res.render('index.ejs', {
    sketch: sketch,
    doctypes: client.doctypes
  });
  res.end();
}

app.param('id', function (req, res, next, id) {
  if (/^[0-9a-zA-Z]{5}$/.test(id)) {
    console.log("Matching sketch with ID " + id);

    client.load(id, function (err, sketch) {
      console.log("client.load responded with " + (err ? "no" : "a") + " sketch");

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

app.post('/save/:id?', function (req, res, next) {
  var sketch = req.sketch || new client.Sketch();
  var revision = new client.Revision();

  // Handle 404 on the sketch ID
  if (typeof req.params.sketch === "string" && req.params.sketch !== sketch.id) {
    return next();
  }

  revision.update(req.body);
  sketch.revisions.add(revision);

  client.save(sketch, function (err) {
    if (!err) {
      res.redirect('/' + sketch.id + '/' + revision.id);
    }
  });
});

app.post('/render', function (req, res) {
  var sketch = new client.Sketch();
  
  sketch.revisions.add(new client.Revision(req.body));

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