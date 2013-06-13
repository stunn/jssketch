define(
  ['models/collection', 'editortabs/viewer'],
  function (Collection, Viewer)
  {
    function Coordinator()
    {
      this.viewers = new Collection(Viewer);

      var that = this;
      this.viewers.on('add', function (viewer) {
        viewer.on('change', 'current', function (newVal, oldVal) {
          that.viewers.forEach(function (v) {
            if (v !== viewer && v.get('current') === newVal) {
              if (typeof oldVal !== 'undefined') {
                v.set('current', oldVal);
              }
            }
          });
        });
      });
    }

    Coordinator.prototype.addViewer = function (viewer) {
      this.viewers.add(viewer);
    };

    return Coordinator;
  }
);
