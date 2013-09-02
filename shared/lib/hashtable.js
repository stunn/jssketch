/**
 * Simple hash table implementation (with a little optimisation for integer
 * keys).
 *
 * @author James Stephenson
 */
function HashTable(options)
{
  this.table = [];

  var defaultOptions = {
    buckets: 32
  };

  if (typeof options !== 'null' && typeof options === 'object' &&
      !Array.isArray(options)) {
    this.options = jQuery.extend({}, defaultOptions, options);
  }

  this.options = defaultOptions;
}

/**
 * Add an item. The desired key must not already exist.
 *
 * @param {String|Integer} key
 * @param {*} value
 * @return void
 */
HashTable.prototype.add = function (key, value) {
  var item = { key: key, value: value };

  var bucket = this.getBucket(key);
  var index = this.getItemIndexInBucket(bucket, key);

  if (index !== false)
  {
    throw new Error('Duplicate key: \'' + key + '\'');
  }

  bucket.push(item);
};

/**
 * Retrieve an item.
 *
 * @param {String|Integer} key
 * @return {*}
 */
HashTable.prototype.get = function (key) {
  var item = this.find(key);
  return item.bucket[item.index].value;
};

/**
 * Remove an item.
 *
 * @param {String|Integer} key
 * @return {void}
 */
HashTable.prototype.remove = function (key) {
  var item = this.find(key);
  item.bucket.splice(item.index, 1);
};

/**
 * Locate an item, returning the bucket and the item's index.
 *
 * @param {String|Integer} key
 * @return {Object} Contains 'bucket' and 'index' properties.
 */
HashTable.prototype.find = function (key) {
  var bucket = this.getBucket(key);
  var index = this.getItemIndexInBucket(bucket, key);

  if (index === false) {
    throw new Error('Key does not exist: \'' + key + '\'');
  }

  return { bucket: bucket, index: index };
}

/**
 * Return the appropriate bucket for the key specified. Lazy initialises the
 * buckets where necessary.
 *
 * @param {String|Integer} key
 * @return {Object[]} The bucket array.
 */
HashTable.prototype.getBucket = function (key) {
  var bucketIndex = this.hash(key) % this.options.buckets;

  if (typeof this.table[bucketIndex] === 'undefined') {
    this.table[bucketIndex] = [];
  }

  return this.table[bucketIndex];
};

/**
 * Find an item with 'key' in 'bucket' and return its index, or false if it
 * isn't found.
 *
 * @param {Object[]} bucket Bucket to search.
 * @param {String|Integer} key Key to search for.
 * @return {Integer|Bool} Index if found, false otherwise.
 */
HashTable.prototype.getItemIndexInBucket = function (bucket, key) {
  for (var i = 0, len = bucket.length; i != len; i++) {
    if (bucket[i].key === key) {
      return i;
    }
  }

  return false;
};

/**
 * djb2 - quick but effective!
 *
 * @param {String|Integer} hashable Value to be hashed. If supplying a string,
 *   ASCII only please.
 * @return {Integer}
 */
HashTable.prototype.hash = function (hashable) {
  // If we're given a number just pass it straight through.
  // TODO: Proper integer check.
  if (typeof hashable === 'number' && hashable >= 0 && hashable % 1 == 0) {
    return hashable;
  }

  if (typeof hashable !== 'string') {
    throw new Error('Invalid key \'' + hashable + '\' - must be integer or ' +
      'string.');
  }

  var hash = 5381;
  for (var i = 0, len = hashable.length; i != len; i++)
  {
    hash = ((hash << 5) + hash) + hashable[i].charCodeAt(0);
  }

  return hash;
};

module.exports = HashTable;