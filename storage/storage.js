/*jslint unused: false */

'use strict';

function Storage() {

}

/**
 * Handler for any install scripts etc. that need to be ran prior to using
 * the application. (e.g. create tables etc.).
 *
 * @param callback(err)
 */
Storage.prototype.install = function (callback) {
  callback(null);
};

Storage.prototype.Error = function (information, isStorage) {
  Error.call(this, information);

  Object.defineProperty(this, 'isStorage', {
    enumerable: true,
    value: !!isStorage
  });
};

Storage.prototype.Error.prototype = new Error();

/**
 * Gets provided with a new sketch that has not been saved before. Implementors
 * should save the provided sketch to the storage medium and invoke the callback,
 * passing the generated ID as the 2nd parameter.
 *
 * It will never be the case that a sketch provided has previously been saved, or
 * will have an ID attribute set.
 *
 * @param sketch A simple object of the sketch we are saving
 * @param callback(err, id) ID should be a string
 * @param generator Function that should be invoked to generate a new ID. This ID
 *        may already be allocated to a sketch, so the workflow here is to generate
 *        IDs until a unique one is found.
 */
Storage.prototype.saveSketch = function(sketch, callback, generator) {};

/**
 * Retrieves a sketch with the given ID. There is no guarantee that a sketch with
 * that ID exists. In this case, the implementor should raise a non-storage
 * error.
 *
 * @param id The ID of the sketch we want to retrieve
 * @param callback(err, sketch) Sketch should be a simple object of the sketch.
 */
Storage.prototype.getSketch = function (id, callback) {};

/**
 * Associates a revision with a particular sketch ID. The revision will not have
 * been saved before.
 *
 * The provided sketch ID will exist; there is no need to validate it's existance.
 *
 * @param revision A simple object of the revision
 * @param cssAssets An array of simple objects for the CSS assets. 0 length if no assets.
 * @param jsAssets An array of simple objects for the JS assets. 0 length if no assets.
 * @param sketchId The ID of the sketch to associate the revision to.
 * @param callback(err, ID) ID should be a Number
 */
Storage.prototype.addRevisionToSketch = function (revision, cssAssets, jsAssets, sketchId, callback) {};

/**
 * Retrieves the revision with the specified ID, belonging to the particular sketch.
 * There is no guarantee the revision or sketch exists; in this case, a non-storage
 * error should be provided in the callback.
 *
 * @param revisionId A numerical value of the ID we want to retrieve
 * @param sketchId A string of the sketch ID the revision should belong to
 * @param callback(err, revision, cssAssets, jsAssets, sketchId) Reverse of arguments to getSketch
 */
Storage.prototype.getRevision = function (revisionId, sketchId, callback) {};

/**
 * Gets provided with a new AJAX model that has not been saved before. Implementors
 * should save the provided AJAX representation to the storage medium and invoke
 * the callback, passing the generated ID as the 2nd parameter.
 *
 * It will never be the case that a AJAX model provided has previously been saved,
 * or will have an ID attribute set.
 *
 * @param ajax A simple object of the AJAX model we are saving
 * @param callback(err, id) ID should be a string
 * @param generator Function that should be invoked to generate a new ID. This ID
 *        may already be allocated to an AJAX entry, so the workflow here is to
 *        generate IDs until a unique one is found.
 */
Storage.prototype.saveAjax = function (ajax, callback, generator) {};

/**
 * Retrieves a simple object for the AJAX entry with the provided ID. There is
 * no guarantee that an entry with that ID exists. In this case, a non-storage
 * error should be provided to the callback.
 *
 * @param id The ID of the AJAX entry to retrieve
 * @param callback(err, obj) obj will be a simple object of the AJAX entry
 */
Storage.prototype.getAjax = function (id, callback) {};

/**
 * Retrieves the simple objects for AJAX requests that are associated to a particular
 * Revision. The sketch and revision IDs are guaranteed to be valid. If no AJAX entries
 * exist, provide the callback with an empty array.
 *
 * @param sketchId A string of the sketch ID we want to get AJAX entries for
 * @param revisionId A number representation of the revision
 * @param callback(err, array) array should be a array of simple AJAX objects.
 *                             If non exist, provide an empty array.
 */
Storage.prototype.getAjaxForRevision = function (sketchId, revisionId, callback) {};

/**
 * Associates the AJAX objects with the Revision provided. Both the revision and
 * sketch ID's will be valid, and the AJAX IDs will have been validated for existance.
 *
 * @param sketchId A string of the sketch ID we want to save AJAX entries for
 * @param revisionId A number representation of the revision
 * @param ajaxRequests An array of AJAX simple objects we want to associate with
 *                     the revision.
 * @param callback(err)
 */
Storage.prototype.saveAjaxForRevision = function (sketchId, revisionId, ajaxRequests, callback) {};

module.exports.create = function () {
  return new Storage();
};