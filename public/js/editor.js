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
   'editortabs/tabstrategies', 'editortabs/coordinator', 'handlebars',
   'codemirror/mode/css/css', 'codemirror/mode/javascript/javascript',
   'codemirror/mode/xml/xml', 'codemirror/mode/htmlmixed/htmlmixed'],
  function (jQuery, CodeMirror, Application, LibManagerPresenter,
    EditorPresenter, Tab, tabStrategies, EditorCoordinator)
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
      var cms = [];
      var foo = { js: 'javascript', html: 'htmlmixed', css: 'css' };
      Object.keys(foo).forEach(function (k) {
        var el = document.createElement('div');
        cms.push(CodeMirror(el, { mode: foo[k] }));
        tabs.push(new Tab({
          id: k,
          contentEl: $(el),
          switchStrategy: tabStrategies.CodeMirrorStrategy
        }));
      });

      var resultTab = new Tab({
        id: 'result',
        contentEl: $('#render'),
        switchStrategy: tabStrategies.PreviewStrategy
      });
      tabs.push(resultTab);

      var coordinator = new EditorCoordinator();
      var e1 = new EditorPresenter($('#editor_1'), tabs, tabs[0], coordinator);
      var e2 = new EditorPresenter($('#editor_2'), tabs, tabs[1], coordinator);

      $('#run_btn').on('click', function (e) {
        e.preventDefault();

        var $form = $('#the-form');
        $form.prop({
          target: 'render',
          action: $form.data('preview-url')
        });

        ['javascript', 'html', 'css'].forEach(function (v, k) {
          $form.find('input[name="' + v + '"]').val(cms[k].getValue());
        });

        e2.setActiveTab(resultTab);

        $form.submit();
      });
    });
  }
);
