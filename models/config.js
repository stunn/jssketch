'use strict';

var path = require('path');
var Model = require('../shared/models/model');

function config(name) {
  return path.join(__dirname, '..', 'config', name + '.json');
}

var Config = new Model({
  properties: {
    production: {
      type: 'boolean',
      fallback: false,
      updateable: true
    },

    trust_proxy: {
      type: 'boolean',
      fallback: false,
      updateable: true
    },

    base: {
      type: 'string',
      fallback: 'jssketch.local.mattlunn.me.uk',
      updateable: true
    },

    jail: {
      type: 'string',
      fallback: 'jssketch-other.local.mattlunn.me.uk',
      updateable: true
    },

    base_alias: {
      type: 'string',
      updateable: true
    },

    jail_alias: {
      type: 'string',
      updateable: true
    },

    port: {
      type: 'number',
      fallback: 3000,
      updateable: true
    },

    prefix: {
      type: 'string',
      fallback: '/',
      updateable: true
    },

    storage: {
      fallback: 'memory',
      updateable: true
    },

    storage_args: {
      type: Array,
      fallback: [],
      updateable: true
    },

    css_libraries_path: {
      type: 'string',
      fallback: config('css_libraries'),
      updateable: true
    },

    js_libraries_path: {
      type: 'string',
      fallback: config('js_libraries'),
      updateable: true
    },

    doctypes_path: {
      type: 'string',
      fallback: config('doctypes'),
      updateable: true
    },

    version: {
      type: 'string',
      fallback: (function () {
        var path = require('path');
        var fs = require('fs');
        var vFile = path.join(__dirname, '..', 'VERSION');

        if (fs.existsSync(vFile)) {
          var contents = fs.readFileSync(vFile, 'utf8');

          if (contents.length) {
            return contents;
          }
        }

        return require('../package.json').version;
      }()),
      updateable: false
    },

    js_libraries: {
      type: 'object',
      fallback: {}
    },

    css_libraries: {
      type: 'object',
      fallback: {}
    },

    doctypes: {
      type: 'object',
      fallback: {}
    }
  }
});

(function () {

  function url(base, port, prefix, to, absolute) {
    var ret = '';

    if (absolute) {
      ret = 'http://' + base;

      if (port !== 80) {
        ret += ':' + port;
      }
    }

    ret += prefix || '';

    // Prevent '//' between prefix and to
    return ret + (ret.slice(-1) === '/' && to[0] === '/' ? to.slice(1) : to);
  }

  Config.prototype.getBaseUrl = function (to, absolute) {
    return url(this.get('base'), this.get('port'), this.get('prefix'), to, absolute);
  };

  Config.prototype.getJailUrl = function (to, absolute) {
    return url(this.get('jail'), this.get('port'), this.get('prefix'), to, absolute);
  };

  Config.prototype.getAssetUrl = function (to, absolute) {
    return this.getBaseUrl(to, absolute) + '?v=' + this.get('version');
  };

}());

module.exports = Config;