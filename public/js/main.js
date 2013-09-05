jQuery(document).ready(function ($) {
  var LibManagerPresenter = require('./librarymanager/presenter');
  var libManagerPresenter = new LibManagerPresenter($('#library-manager'));
  var editorManager = require('./editor');

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

  $('#run_btn').on('click', function (e) {
    var $form = $('#the-form');

    e.preventDefault();

    $form.prop({
      target: 'render',
      action: $form.data('preview-url')
    });

    editorManager.setActiveTab(1, 'result');

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