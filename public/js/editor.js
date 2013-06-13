function log(message)
{
  if (typeof console !== "undefined")
  {
    console.log(message);
  }
}

define(
  ['jquery', 'codemirror/lib/codemirror', 'application',
   'librarymanager/presenter', 'editortabs/presenter', 'editortabs/tab',
   'editortabs/coordinator', 'handlebars', 'codemirror/mode/css/css',
   'codemirror/mode/javascript/javascript', 'codemirror/mode/xml/xml'],
  function (jQuery, CodeMirror, Application, LibManagerPresenter,
    EditorPresenter, Tab, EditorCoordinator)
  {
    $(document).ready(function () {
      var libManagerPresenter = new LibManagerPresenter($('#library-manager'));
      libManagerPresenter.loadFromJSON(
        [
          {
            libraryType: 'js',
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

      // Throw out a quick editor ...
      var coordinator = new EditorCoordinator();
      var foo = document.createElement('div');
      CodeMirror(foo);
      var tabs = [
        new Tab({ id: 'html', contentEl: foo}),
        new Tab({ id: 'js', contentEl: $('<div>B</div>')})
      ];
      var editorPresenter = new EditorPresenter($('#editor_1'), tabs, coordinator);
      var editorPresenter2 = new EditorPresenter($('#editor_2'), tabs, coordinator);
    });
  }
);
