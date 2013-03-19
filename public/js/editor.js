function log(message)
{
  if (typeof console !== "undefined")
  {
    console.log(message);
  }
}

define(
  ['jquery', 'codemirror/lib/codemirror', 'application',
   'librarymanager/presenter', 'handlebars', 'codemirror/mode/css/css',
   'codemirror/mode/javascript/javascript', 'codemirror/mode/xml/xml'],
  function (jQuery, CodeMirror, Application, Presenter)
  {
    $(document).ready(function () {
      var libManagerPresenter = new Presenter($('#library-manager'));
      libManagerPresenter.loadFromJSON(
        [
          {
            "type":"js",
            "parent":{
              "type":"js",
              "library":2,
              "id":"1"
            },
            "library":1,
            "id":"1"
          },
          {
            "type":"js",
            "parent":null,
            "library":2,
            "id":"1"
          }
        ]
      );
    });
  }
);
