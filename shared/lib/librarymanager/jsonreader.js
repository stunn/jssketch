var app = require('../application');
/**
 * Convert library manager JSON in to a list of DM models.
 *
 * @author James Stephenson
 */
function JsonReader()
{
}

/**
 * Process input JSON, return an array of the DM models represented within
 * in order of appearance.
 *
 * @param {JSON} input
 * @return {Version[]}
 */
JsonReader.read = function (input) {
  var result = [];

  // Resolve libraries.
  input.forEach(function (entry) {
    var version = app.dm.getLibraryVersion(
      entry.libraryType,
      entry.libraryId,
      entry.versionId);

    // TODO: Will this actually be undefined? Do we want to handle the error
    // this way?
    if (typeof version === 'undefined') {
      throw new Error('JsonReader: Could not resolve library.');
    }

    result.push(version);
  });

  return result;
};

module.exports = JsonReader;