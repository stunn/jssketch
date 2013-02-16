(function () {

"use strict";

jQuery(document).ready(function ($) {
  Application.init();

  var panes = Application.get('panes');

  for (var i=0;i<panes.length;i++) {
    var settings = panes[i];
    var pane = $('#' + settings.id);

    pane.width(settings.width + '%');

    for (var j=0;j<settings.windows.length;j++) {
      var panel = settings.windows[j];

      $('#' + panel.id).detach().height(panel.height + '%').appendTo(pane);
    }
  }

  $(window).on('beforeunload', function () {
    var panes = Application.get('panes');

    for (var i=0;i<panes.length;i++) {
      var settings = panes[i];
      var pane = $('#' + settings.id);

      settings.width = (100 * pane.width()) / pane.offsetParent().width();
      settings.windows.length = 0;

      pane.children('section').each(function () {
        var self = $(this);

        settings.windows.push({
          id: this.id,
          height: (100 * self.height()) / self.offsetParent().height()
        });
      });
    }

    Application.set('panes', panes);
    Application.save();
  });
});

jQuery(document).ready(function ($) {
  // The panes must be initialized in this order, otherwise the addition of the drag
  // handle to the left pane adds the drag handle to the last section in the left pane
  // (as the panes() plugin then thinks it's no longer the last child).

  // Setup the 3 panes on the left (horizontal)
  $('#main .pane.left').panes("y").on('panesstop', function () {
    $(this).children('section').width('100%');
  });

  // Setup the left/ right vertical pane
  $('#main').panes("x");

  // Resizable (therefore in turn panes) turns our nice %ages into pixels... which
  // is so useful when the browser resizes, you won't believe. This changes these back
  // into %ages. Ideally I wanted to "fix" this behaviour in panes, so the resulting
  // height & width would be in the same unit the starting height & width were; however,
  // it seems theres no easy, x-browser way to retrieve this unit, so we're hacking it in here.
  $(document).on('panesstop', function (e, a, b) {
    for (var ar = [a, b], i=0; i<ar.length; i++) {
      var el = $(ar[i]);
      var parent = el.offsetParent();

      el.width((100 * el.width()) / parent.width() + "%");
      el.height((100 * el.height()) / parent.height() + "%");
    }
  });

  // Enables shields when dragging to stop items (e.g. iframes) consuming the drag events.
  $(document.body).on('panesstart panesstop', function (e) {
    $(this).toggleClass('shielded', e.type === "panesstart");
  });
});

jQuery(document).ready(function ($) {
  $('textarea.codemirror').each(function () {
    var mirror = CodeMirror.fromTextArea(this, {
      mode: this.getAttribute('data-mode'),
      indentWithSpaces: true,
      tabSize: 2,
      indentUnit: 2,
      smartIndent: true,
      lineNumbers: true
    });

    mirror.setSize('100%', '100%');

    $(this).data('mirror', mirror);
  });


  $(document).on('click', 'button.tidy-trigger', function () {
    var instance = $(this).closest('section').find('textarea.codemirror').data('mirror');

    for (var i=0,len=instance.lineCount();i<len;i++) {
      instance.indentLine(i);
    }
  });

  $('select.sexy-select').sexify({
    classes: 'btn-mini btn-primary'
  });
});

jQuery(document).ready(function ($) {
  var form = $('#the-form').on('click', 'button[type="submit"]', function () {
    switch (this.name) {
      case 'preview':
        form.prop({
          target: 'render',
          action: form.data('preview-url')
        });
      break;
      case 'save':
        form.prop({
          target: '',
          action: form.data('save-url')
        });
      break;
    }
  });
});

}());