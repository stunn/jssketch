var Asset = require('../models/asset');

module.exports = {
  updateRevisionFromHash: function (revision, doctypes, dm, hash, error) {
    var assetTypes = ['css', 'js'];
    var assetKeys = assetTypes.map(function (type) {
      return type + '_assets';
    });

    if (typeof error !== 'function') {
      error = function (reason) {
        console.log(reason);

        return false;
      };
    }

    revision.set(hash);
    revision.set('createdAt', new Date());

    // If what we've got so far is valid, move onto checking the assets.
    if (revision.validate() !== true || !doctypes.hasOwnProperty(revision.get('doctype'))) {
      return error('Revision did not validate');
    }

    // We need to validate that each asset list is an array of objects first,
    // as inter-type dependancy checking can hit all lists. We can therefore
    // re-validate the list every time we hit it, or validate first and then
    // access without checking.
    for (var i=0;i<assetKeys.length;i++) {
      var keyKey = assetKeys[i];
      var array;

      try {
        hash[keyKey] = array = JSON.parse(hash[keyKey]);
      } catch (e) {}

      // Check that the input is actually an array we can iterate over.
      // Note that this may not be an array of objects; it's just an array
      // of some types.
      if (!Array.isArray(array)) {
        return error(keyKey + ' is not a valid JSON array');
      }

      // This is where we check each element of the array is a non-null object.
      if (!array.every(function (keyKey) {
        return typeof keyKey === 'object' && keyKey !== 'null';
      })) {
        return error('Asset is a non-object');
      }
    }

    for (i=0;i<assetTypes.length;i++) {
      var type = assetTypes[i];
      var typeKey = assetKeys[i];

      var collection = revision[typeKey.replace(/_([a-z])/g, function (_, c) {
        return c.toUpperCase();
      })];
      var assetsOfType = hash[typeKey];

      for (var j=0;j<assetsOfType.length;j++) {
        var assetRep = assetsOfType[j];
        var asset = new Asset();

        switch (assetRep.type) {
        // Only CSS or JS assets can have a parent ('user' can't). If there
        // is a parent, check it is included in the sketch & exists.
        case type:
          var parent = assetRep.parent;

          // Then we have to validate parent
          if (typeof parent === 'object' && parent !== null) {
            if (['css', 'js'].indexOf(parent.type) === -1) {
              return error('Asset parents must be of CSS or JS, not ' + parent.type);
            }

            // Check the parent is included in the sketch.
            if (!hash[parent.type + '_assets'].some(function (assetRep) {
              return assetRep.library === parent.library && assetRep.id === parent.id;
            })) {
              return error('Asset references a parent which is not present in the revision');
            }

            // dm.getLibraryVersion returns a Version or false. If it's false, it'll be picked
            // up by the validate() function.
            asset.set('parent', dm.getLibraryVersion(parent.type, parent.library, parent.id));
          }

          asset.set('version', dm.getLibraryVersion(type, assetRep.library, assetRep.id));
          break;
        case 'user':
          // DM does all the hard work of validating ID. It'll return false if
          // invalid, which'll be picked up by validate() later.
          asset.set('version', dm.createVersion(assetRep.id));
          break;
        default:
          return error('Asset was of the wrong type (' + assetRep.type + ' in ' + typeKey + ')');
        }

        if (asset.validate() === true) {
          collection.add(asset);
        } else {
          return error('Asset validation failed');
        }
      }
    }
  }
};