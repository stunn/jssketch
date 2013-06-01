'use strict';

var mysql = require('mysql');
var utils = require('utils');

function MysqlStorage(options) {
  this._options = options;
  this._pool = mysql.createPool(options);
}

MysqlStorage.prototype = require('./storage').create();

MysqlStorage.prototype.install = function (callback) {
  var connection = mysql.createConnection(utils.extend({}, this._options, {
    multipleStatements: true
  }));

  connection.query([
    'CREATE TABLE IF NOT EXISTS ajax (id varchar(5) NOT NULL, payload text NOT NULL, `type` varchar(10) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=latin1',
    'CREATE TABLE IF NOT EXISTS asset (`key` int(10) unsigned NOT NULL AUTO_INCREMENT, `type` varchar(10) NOT NULL, parent_type varchar(10) DEFAULT NULL, parent_library int(10) unsigned DEFAULT NULL, parent_id varchar(255) DEFAULT NULL, library int(10) unsigned DEFAULT NULL, id varchar(255) NOT NULL, sketch varchar(10) NOT NULL, revision int(10) unsigned NOT NULL, PRIMARY KEY (`key`)) ENGINE=InnoDB  DEFAULT CHARSET=latin1',
    'CREATE TABLE IF NOT EXISTS revision (id int(10) unsigned NOT NULL AUTO_INCREMENT, sketch_id varchar(10) NOT NULL, javascript text NOT NULL, css text NOT NULL, html text NOT NULL, doctype varchar(50) NOT NULL, created_at bigint(20) unsigned NOT NULL, parent_revision_id int(10) unsigned DEFAULT NULL, parent_sketch_id varchar(10) DEFAULT NULL, PRIMARY KEY (id,sketch_id)) ENGINE=InnoDB  DEFAULT CHARSET=latin1',
    'CREATE TABLE IF NOT EXISTS revision_ajax (id int(10) unsigned NOT NULL AUTO_INCREMENT, sketch_id varchar(10) NOT NULL, revision_id int(10) unsigned NOT NULL, ajax_id varchar(10) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB  DEFAULT CHARSET=latin1',
    'CREATE TABLE IF NOT EXISTS sketch (id varchar(10) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=latin1'
  ].join('; '), function (err) {
    callback(err);
  });

  connection.end();
};

/**
 * Retrieves a connection from the pool. If a connection is successfully retrieved,
 * the callback provided to "successHandler" is called, passing the connection as
 * the first parameter. The second parameter is a function to be called once the
 * connection is no longer needed.
 *
 * If a connection could not be successfully opened, errorHandler is invoked, passing
 * a storage error as the first parameter.
 *
 * @param withConnection(connection, done) Callback when connection opened
 * @param errorHandler(err) Callback when a connection could not be opened.
 */
MysqlStorage.prototype._withConnection = function (withConnection, errorHandler) {
  var that = this;

  this._pool.getConnection(function (err, connection) {
    if (err) {
      errorHandler(new that.Error(err.message, true));

      if (connection) {
        connection.end();
      }
    } else {
      withConnection(connection, function () {
        connection.end();
      });
    }
  });
};

/**
 * Runs connection.query() on either the connection provided, or a newly obtained
 * connection. This method accepts all `query()` signatures provided by connection,
 * except the lazy return which lets you stream data.
 *
 * The benefit of this method is that it abstracts any errors originating from the
 * query or from the connection; automatically passing a storage-error to the
 * errorHandler if this occurs.
 *
 * @param args The initial args should be the parameters you want to pass to query()
 * @param successHandler(result) Called when the query has completed. Note the first
 *        parameter is the result, not any error; errors are handled by errorHandler
 * @param errorHandler(err) Called when a storage-error has occurred.
 * @param connection (optional). If provided, the query will use this connection object,
 *        if none is provided, a connection will be obtained through _withConnection.
 */
MysqlStorage.prototype._performQuery = function (/* args, successHandler, errorHandler, connection? */) {
  var that = this;
  var argLen = arguments.length;
  var connection = arguments[argLen - 1];
  var errorHandler = arguments[argLen - 2];
  var successHandler = arguments[argLen - 3];
  var params = [].slice.call(arguments, 0, - 3);

  // If connection wasn't provided, shuffle
  if (typeof connection === 'function') {
    params.push(successHandler);
    successHandler = errorHandler;
    errorHandler = connection;
    connection = null;
  }

  function buildQueryCallback(connectionCallback) {
    return function (err /*, results */) {
      if (err) {
        errorHandler(new that.Error(err.message, true));
      } else {
        successHandler.apply(null, [].slice.call(arguments, 1));
      }

      if (connectionCallback) {
        connectionCallback();
      }
    };
  }

  if (connection) {
    params.push(buildQueryCallback(null));
    connection.query.apply(connection, params);
  } else {
    this._withConnection(function (connection, done) {
      params.push(buildQueryCallback(done));

      connection.query.apply(connection, params);
    }, errorHandler);
  }
};

/**
 * Formats data into a SQL insert statement. Multi-inserts are supported. camelCased
 * attributes are under_scored.
 *
 * Normal use:
 *     var query = this._formatInsertQuery('foo', { x: 4 }, {x: 'y'});
 *
 *     query.statement; // INSERT INTO foo (y) VALUES (?)
 *     query.values;    // [4]
 *
 *     this._performQuery(query.statement, query.values, function () {}, function () {});
 *
 * @param table "INSERT INTO table"
 * @param objs The value(s) we're inserting. This can either be an individual object
 *        or an array of objects. If an array is provided, each object must have
 *        exactly the same keys. Keys for the columns are taken from the first
 *        object.
 * @param maps A map of attributes -> column names. This takes precendence over
 *        the default camelCase -> under_score mapping.
 * @return object "statement" property is the INSERT statement. "values" property
 *         is an array of values in the prepared statement.
 */
MysqlStorage.prototype._formatInsertQuery = function (table, objs, maps) {
  if (!Array.isArray(objs)) {
    objs = [objs];
  }

  if (!objs.length) {
    return;
  }

  if (typeof maps !== 'object' || maps === null) {
    maps = {};
  }

  var values = [];
  var keys = Object.keys(objs[0]);
  var statement = 'INSERT INTO ' + table + ' (' + keys.map(function (key) {
    return maps[key] || utils.underscore(key);
  }).join(', ') + ') VALUES';

  objs.forEach(function (obj, i) {
    statement += (i === 0 ? '' : ', ') + '(?' + (new Array(keys.length)).join(', ?') + ')';
    values.push.apply(values, keys.map(function (key) {
      return obj[key];
    }));
  });

  return {
    statement: statement,
    values: values
  };
};

MysqlStorage.prototype.saveSketch = function (sketch, callback, generator) {
  var that = this;

  this._withConnection(function (connection, done) {
    (function (step) {
      var id = generator();

      connection.query('INSERT INTO sketch (id) VALUES (?)', [id], function (err) {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            step();
          } else {
            callback(new that.Error(err.message, true));
            done();
          }
        } else {
          callback(null, id);
          done();
        }
      });
    }());
  }, callback);
};

MysqlStorage.prototype.getSketch = function (id, callback) {
  var that = this;

  this._performQuery('SELECT * FROM sketch WHERE id = ?', [id], function (results) {
    if (results.length) {
      callback(null, results[0]);
    } else {
      callback(new that.Error(id + ' does not exist', false));
    }
  }, callback);
};

MysqlStorage.prototype.addRevisionToSketch = function (revision, cssAssets, jsAssets, sketchId, callback) {
  var that = this;

  revision.sketchId = sketchId;

  this._withConnection(function (connection, done) {
    function fail(err) {
      // Play safe over the transaction being cancelled or not. Transactions
      // are automatically rolled back if the connection is closed.
      //
      // For this reason, we purposefully don't call done().
      connection.destroy();
      callback(err);
    }

    that._performQuery('START TRANSACTION', function () {
      that._performQuery('SELECT * FROM revision', function () {
        that._performQuery('SELECT MAX(id) AS largest FROM revision WHERE sketch_id = ?', [sketchId], function (results) {
          var query;

          revision.id = (results[0].largest || 0) + 1;
          query = that._formatInsertQuery('revision', revision);

          that._performQuery(query.statement, query.values, function () {
            var query;
            var assets = cssAssets.concat(jsAssets).map(function (asset) {
              asset.revision = revision.id;
              asset.sketch = sketchId;

              return asset;
            });

            function succeed() {
              that._performQuery('COMMIT', function () {
                callback(null, revision.id);
                done();
              }, fail, connection);
            }

            if (assets.length) {
              query = that._formatInsertQuery('asset', assets, {
                parent: 'parent_id'
              });

              that._performQuery(query.statement, query.values, succeed, fail, connection);
            } else {
              succeed();
            }
          }, fail, connection);
        }, fail, connection);
      }, fail, connection);
    }, fail, connection);
  });
};

MysqlStorage.prototype.getRevision = function (revisionId, sketchId, callback) {
  var that = this;

  this._performQuery('SELECT * FROM revision WHERE sketch_id = ? AND id = ? LIMIT 1', [sketchId, revisionId], function (result) {
    if (!result.length) {
      callback(new that.Error(sketchId + ' v' + revisionId + ' does not exist', false));
    } else {
      var revision = result[0];

      that._performQuery('SELECT * FROM asset WHERE sketch = ? AND revision = ?', [sketchId, revisionId], function (results) {
        var assets = {
          css: [],
          js: []
        };

        results.forEach(function (result) {
          if (result.parent_id === null) {
            result.parent = null;
          } else {
            result.parent = {
              library: result.parent_library,
              type: result.parent_type,
              id: result.parent_id
            };
          }

          assets[result.type].push(result);
        });

        callback(null, revision, assets.css, assets.js);
      }, callback);
    }
  }, callback);
};

MysqlStorage.prototype.saveAjax = function (ajax, callback, generator) {
  var that = this;

  that._withConnection(function (connection, done) {
    (function (step) {
      var query;

      ajax.id = generator();
      query = that._formatInsertQuery('ajax', ajax);

      connection.query(query.statement, query.values, function (err) {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            step();
          } else {
            callback(new that.Error(err.message, true));
            done();
          }
        } else {
          callback(null, ajax.id);
          done();
        }
      });
    }());
  }, callback);
};

MysqlStorage.prototype.getAjax = function (id, callback) {
  var that = this;

  this._performQuery('SELECT * FROM ajax WHERE `id` = ? LIMIT 1', [id], function (result) {
    if (result.length) {
      callback(null, result[0]);
    } else {
      callback(new that.Error(id + ' does not exist', false));
    }
  }, callback);
};

MysqlStorage.prototype.getAjaxForRevision = function (sketchId, revisionId, callback) {
  this._performQuery('SELECT * FROM ajax WHERE id IN (SELECT ajax_id FROM revision_ajax WHERE sketch_id = ? AND revision_id = ?)', [sketchId, revisionId], function (results) {
    callback(null, results);
  }, callback);
};

MysqlStorage.prototype.saveAjaxForRevision = function (sketchId, revisionId, ajaxRequests, callback) {
  var query = this._formatInsertQuery('revision_ajax', ajaxRequests.map(function (ajax) {
    return {
      sketch_id: sketchId,
      revision_id: revisionId,
      ajax_id: ajax.id
    };
  }));

  this._performQuery(query.statement, query.values, function () {
    callback(null);
  }, callback);
};

module.exports = function (conn) {
  return new MysqlStorage(conn);
};