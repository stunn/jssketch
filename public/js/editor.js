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
   'codemirror/mode/javascript/javascript', 'codemirror/mode/xml/xml',
   'codemirror/mode/htmlmixed/htmlmixed'],
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

      var tabs = [];
      var foo = { js: 'javascript', html: 'htmlmixed', css: 'css' };
      Object.keys(foo).forEach(function (k) {
        var el = document.createElement('div');
        CodeMirror(el, { mode: foo[k] });
        tabs.push(new Tab({ id: k, contentEl: $(el) }));
      });

      var coordinator = new EditorCoordinator();
      new EditorPresenter($('#editor_1'), tabs, coordinator);
      new EditorPresenter($('#editor_2'), tabs, coordinator);
    });
  }
);
