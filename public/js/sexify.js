(function ($) {
  "use strict";

  var template = $([
    '<div class="btn-group">',
      '<button class="btn btn-mini btn-primary" data-toggle="dropdown" style="text-align:left;"><span class="selected"></span>&nbsp;<span class="caret" style="float:right;"></span></button>',
      '<ul class="dropdown-menu">',
      '</ul>',
    '</div>'].join(''));

  /**
   * Turns a <select> element into a Bootstrap dropdown.
   *
   * Usage: Call $('select').sexify(). Prefs is an optional object of settings.
   * - classes is a string of classes to add to the <button> element in the Bootstrap dropdown.
   *   e.g. btn-mini, btn-primary to set bootstrap styles etc.
   * - width is the width the button should be set to. Set to auto to be the width of the largest
   *   option.
   * 
   * sexify will trigger `change` events on the original select when a new element is selected.
   * sexify does not currently support <select multiple> elements.
   */
  jQuery.fn.sexify = function (prefs) {
    var prefs = jQuery.extend({
      classes: '',
      width: 'auto'
    }, prefs);

    return this.each(function () {
      var replacement = template.clone();
      var options = replacement.find('.dropdown-menu');
      var button = replacement.find('button').dropdown().addClass(prefs.classes);
      var original = $(this);

      for (var i=0;i<this.options.length;i++) {
        $('<li />').data('value', this.options[i].value).appendTo(options).append($('<a />', {
          text: this.options[i].label,
          href: '#'
        }));
      }

      original.hide().after(replacement);

      function setSelected(label, val) {
        button.children('span.selected').text(label);
        original.val(val);
      }

      replacement.on('click', 'ul.dropdown-menu a', function (e) {
        var self = $(this);

        setSelected(self.text(), self.parent().data('value'));
        original.trigger('change', true);
        e.preventDefault();
      });

      original.on('change', function (e, us) {
        if (!us) {
          var selected = this.options[this.selectedIndex];

          setSelected(selected.label, selected.value);
        }
      }).trigger('change');

      if (prefs.width === "auto") {
        var text = button.children('span.selected');
        var orig = text.text();
        var max = 0;
        var width;

        for (var i=0;i<this.options.length;i++) {
          text.text(this.options[i].label);
          width = button.width();

          if (width > max) {
            max = width;
          }
        }

        text.text(orig);
        button.width(max + 'px');
      }
    });
  };

}(jQuery));