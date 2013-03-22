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
            libraryType: "js",
            libraryId: 1,
            versionId: '1',
            dependsOn: null
          },
          {
            libraryType: 'js',
            libraryId: 2,
            versionId: '1',
            dependsOn: [{
              libraryType: 'js',
              libraryId: 1,
              versionId: '1',
              dependsOn: null
            }]
          }
        ]
      );
    });
  }
);
