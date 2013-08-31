function log(message)
{
  if (typeof console !== "undefined")
  {
    console.log(message);
  }
}

define(
  ['module', 'jquery', 'codemirror/lib/codemirror', 'application',
   'librarymanager/presenter', 'editortabs/presenter', 'editortabs/tab',
   'editortabs/coordinator', 'handlebars', 'codemirror/mode/css/css',
   'codemirror/mode/javascript/javascript', 'codemirror/mode/xml/xml',
   'codemirror/mode/htmlmixed/htmlmixed'],
  function (module, jQuery, CodeMirror, Application, LibManagerPresenter,
    EditorPresenter, Tab, EditorCoordinator)
  {
    var config = module.config();

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

      var coordinator = new EditorCoordinator();
      var presenters = [];
      var tabs = [];
      var editors = {
        javascript: 'javascript',
        html: 'htmlmixed',
        css: 'css'
      };

      Object.keys(editors).forEach(function (type) {
        var target = $('textarea[name="' + type + '"]');
        var instance = CodeMirror.fromTextArea(target[0], {
          mode: editors[type]
        });
        var tab = new Tab({
          id: type,
          contentEl: $(instance.getWrapperElement())
        });

        instance.setSize(null, '100%');

        tab.on('show', function (el, container) {
          var $container = $(container);

          $container.children().detach();
          $container.append($(el));
        });

        tab.on('hide', function (el, container) {
          $(container).children().detach();
        });

        tabs.push(tab);
      });

      (function () {
        var tab = new Tab({
          id: 'result',
          contentEl: $('#render')
        });

        tabs.push(tab);

        // The showing and hiding of the render iframe is handled by the
        // presenter handlers below. This is because only one Editor contains
        // the iframe, as detaching and reattaching an iframe causes it to
        // reload, and we don't have enough context here for what we want to do.
        //
        // If the editor which holds the iframe is set to "render", its a simple
        // change of tabs. Otherwise however, we swap the editors over using the
        // "lhs" and "rhs" class toggles, and then swap which tabs are shown in
        // each editor, to "fake" a change.
      }());

      presenters.push(new EditorPresenter($('#editor_1'), tabs, tabs[0], coordinator, false));
      presenters.push(new EditorPresenter($('#editor_2'), tabs, config.isNew ? tabs[1] : tabs[tabs.length - 1], coordinator, true));

      presenters.forEach(function (presenter) {
        presenter.viewer.on('change', 'current', function (newVal, oldVal) {
          if (newVal === 'result' && !presenter.viewer.holdsPreview) {
            presenters.some(function (previewHolder) {
              if (previewHolder.holdsPreview) {
                oldVal = previewHolder.viewer.get('current');

                // This will work now for only 2 editors. If further editors are
                //  supported, this will need ... "work".
                $(previewHolder.editorCont).add(presenter.editorCont)
                                           .toggleClass('lhs')
                                           .toggleClass('rhs');

                presenter.viewer.set('current', oldVal);

                return true;
              }

              return false;
            });
          }

          if (presenter.holdsPreview && (newVal === 'result' || oldVal === 'result')) {
            presenter.editorCont.find('.editor-codepad')
                                .toggle(newVal !== 'result').filter('.dummy')
                                .toggle(newVal === 'result');
          }
        });
      });

      $('#run_btn').on('click', function (e) {
        var $form = $('#the-form');

        e.preventDefault();

        $form.prop({
          target: 'render',
          action: $form.data('preview-url')
        });

        // We could get cleverer with this, and show the iframe in an editor
        // which is empty, or which isn't the most recently used.
        presenters.some(function (p) {
          if (p.holdsPreview) {
            p.viewer.set('current', 'result');

            return true;
          }
        })

        $form.submit();
      });

      $('#publish_btn').on('click', function (e) {
        var $form = $('#the-form');

        $form.prop({
          target: '_self',
          action: $form.data('save-url')
        });
      });
    });
  }
);
