var Revision = require('./broker').load('models/revision');
var Asset = require('./broker').load('models/asset');

var utils = require('utils');

module.exports = function (client) {
  return {
    loadAndVerifyRevisionFromUrl: function (req, _, next) {
      var sketchId = req.params.id;
      var revisionId = req.params.rev;

      // Check that the rev and the id are actual sketch ID's and revision ID's...
      // otherwise bail to another handler.
      if (sketchId.length !== 5 || !/^[0-9]+$/.test(revisionId)) {
        return next('route');
      } else {
        revisionId = +revisionId;

        client.loadRevision(revisionId, sketchId, function (err, revision, sketch) {
          if (err) {
            next('route');
          } else {
            req.sketch = sketch;
            req.revision = revision;

            next();
          }
        });
      }
    },

    createAndValidateRevisionFromPostData: function (req, res, next) {
      var revision = req.revision || new Revision();

      var assetTypes = ["css", "js"];
      var assetKeys = assetTypes.map(function (type) {
        return type + "_assets";
      });

      function error(reason) {
        console.log(reason);
        next('route');

        return false;
      }

      revision.update(req.body);

      // If what we've got so far is valid, move onto checking the assets.
      if (revision.validate() !== true || !client.doctypes.some(function (doctype) {
        return doctype.id === revision.doctype;
      })) {
        return error('Revision did not validate');
      }

      // We need to validate that each asset list is an array of objects first,
      // as inter-type dependancy checking can hit all lists. We can therefore re-validate
      // the list every time we hit it, or validate first and then access without checking.
      for (var i=0;i<assetKeys.length;i++) {
        var key = assetKeys[i];
        var array;

        try {
          req.body[key] = array = JSON.parse(req.body[key]);
        } catch (e) {}

        // Check that the input is actually an array we can iterate over.
        // Note that this may not be an array of objects; it's just an array
        // of some types.
        if (!Array.isArray(array)) {
          return error(key + ' is not a valid JSON array');
        }

        // This is where we check each element of the array is a non-null object.
        if (!array.every(function (key) {
          return typeof key === "object" && key !== "null";
        })) {
          return error('Asset is a non-object');
        }
      }

      for (var i=0;i<assetTypes.length;i++) {
        var type = assetTypes[i];
        var key = assetKeys[i];

        var collection = revision[utils.camelize(key)];
        var assetsOfType = req.body[key];

        for (var j=0;j<assetsOfType.length;j++) {
          var assetRep = assetsOfType[j];
          var asset = new Asset();

          switch (assetRep.type) {
            // Only CSS or JS assets can have a parent ("user" can't). If there
            // is a parent, check it is included in the sketch & exists.
            case type:
              var parent = assetRep.parent;

              // Then we have to validate parent
              if (typeof parent === "object" && parent !== null) {
                if (["css", "js"].indexOf(parent.type) === -1) {
                  return error('Asset parents must be of CSS or JS, not ' + parent.type);
                }

                // Check the parent is included in the sketch.
                if (!req.body[parent.type + "_assets"].some(function (assetRep) {
                  return assetRep.library === parent.library && assetRep.id === parent.id;
                })) {
                  return error('Asset references a parent which is not present in the revision');
                }

                // dm.getLibraryVersion returns a Version or false. If it's false, it'll be picked
                // up by the validate() function.
                asset.parent = client.dm.getLibraryVersion(parent.type, parent.library, parent.id);
              }

              asset.version = client.dm.getLibraryVersion(type, assetRep.library, assetRep.id);
            break;
            case "user":
              // DM does all the hard work of validating ID. It'll return false if
              // invalid, which'll be picked up by validate() later.
              asset.version = client.dm.createVersion(assetRep.id);
            break;
            default:
              return error('Asset was of the wrong type (' + assetRep.type + ' in ' + key + ')');
            break;
          }

          if (asset.validate() === true) {
            collection.add(asset);
          } else {
            return error('Asset validation failed');
          }
        }
      }

      req.revision = revision;

      next();
    }
  };
};