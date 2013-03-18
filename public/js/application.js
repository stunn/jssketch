define(['module', 'helpers/dm'], function (module, dmHelper) {
  var config = module.config();
  var defaults = {
    version: 1,
    panes: [{
      id: 'left-pane',
      width: 65,
      windows: [{
        id: 'js',
        height: 100 / 3
      },{
        id: 'css',
        height: 100 / 3
      },{
        id: 'html',
        height: 100 / 3
      }]
    }, {
      id: 'right-pane',
      width: 35,
      windows: [{
        id: 'preview',
        height: 60
      }, {
        id: 'source',
        height: 40
      }]
    }]
  };
  var settings = (function () {
    var loaded;

    try {
      loaded = JSON.parse(window.localStorage.getItem("settings"));
    } catch (e) {
      loaded = defaults;
    }

    if (typeof loaded !== "object" || loaded === null || window.location.hash === "#reset") {
      loaded = defaults;
    }

    switch (loaded.version) {
      // Upgrade Paths
    }

    loaded.version = defaults.version;
    return loaded;
  }());

  return {
    save: function () {
      window.localStorage.setItem("settings", JSON.stringify(settings));
    },

    get: function (key) {
      return settings[key];
    },

    set: function (key, value) {
      settings[key] = value;
    },

    dm: dmHelper.fromSerializedForm({
      css: config.css,
      js: config.js
    }),

    doctypes: config.doctypes
  };
});