define(
  ['handlebars', 'jquery', 'helpers/view', 'editortabs/viewer',
  'editortabs/tab'],
  function (Handlebars, jQuery, ViewHelpers, Viewer, Tab)
  {
    ViewHelpers(Handlebars);

    function Presenter(contId, tabs, startTab, coord)
    {
      var that = this;

      this.editorCont = $(contId);
      this.editorTpl = Handlebars.compile($('#editor-tpl').html());

      // Render in the editor, tabless.
      this.editorCont.append(jQuery.parseHTML(this.editorTpl()));

      this.viewer = new Viewer();

      // Auto-add GUI tabs when underlying viewmodel changes.
      this.viewer.tabs.on('add', function (tab) {
        var $tab = $('<li />');
        $tab.text(tab.get('id'));
        $tab.data('model', tab);
        this.editorCont.find('nav ul').append($tab);
      }.bind(this));

      // Sync the active tab with the underlying viewmodel.
      this.viewer.on('change', 'current', function (newVal, oldVal) {
        $tabs = that.editorCont.find('nav ul').children();

        if (typeof oldVal !== 'undefined') {
          var oldTab = $tabs.filter(function () {
            return $(this).data('model').get('id') === oldVal;
          }).first();
          oldTab.data('model').get('switchStrategy').hide(
            oldTab.data('model').get('contentEl'),
            that.editorCont.find('.editor-codepad'));
          oldTab.removeClass('active');
        }

        var newTab = $tabs.filter(function () {
          return $(this).data('model').get('id') === newVal;
        }).first();

        newTab.data('model').get('switchStrategy').show(
          newTab.data('model').get('contentEl'),
          that.editorCont.find('.editor-codepad'));

        newTab.addClass('active');
      });

      // Set the tabs in to the viewer.
      tabs.forEach(function (tab) {
        this.viewer.tabs.add(tab);
      }.bind(this));
      coord.addViewer(this.viewer);
      this.viewer.set('current', startTab.get('id'));

      this.editorCont.find('nav ul').children().on('click', function (e) {
        e.preventDefault();

        that.viewer.set('current', $(e.target).data('model').get('id'));
      });
    }

    Presenter.prototype.setActiveTab = function (tab) {
      this.viewer.set('current', tab.get('id'));
    };

    return Presenter;
  }
);
