/*jshint loopfunc: true */
"use strict";

var pool = require('../db/index.js').getPool();
var promise = require('bluebird');

// NOTE: when using the methods in this module, append 'Async' to the end of the method name
var diffs = module.exports = promise.promisifyAll({
  // NOTE: by 'return', we really mean 'pass to callback as results arg'

  deleteAll: function (signatureHash, callback) {
    // delete all records from diffs that have a matching users_dashboards_signature_hash
    // no return value
    pool.query('DELETE FROM diffs WHERE users_dashboards_signature_hash=?', [signatureHash], function (err, results) {
      callback(err, 'Diffs deleted');
    });
  },
  addAll: function (signatureHash, diffsArray, callback) {
    // go through diffsArray and add a new record in diffs table for each, with users_dashboards_signature_hash set to signatureHash
    // no return value
    if (diffsArray.length === 0) {
      callback(null, 'Diffs inserted');
    }
    var formattedDiffs = diffsArray.map(function (diff) {
      return [diff.file, diff.mod_type, signatureHash];
    });
    pool.query('INSERT INTO diffs (file, mod_type, users_dashboards_signature_hash) VALUES ?', [formattedDiffs], function (err, results) {
        callback(err, 'Diffs inserted');
    });
  },
  getAllFromUsers: function(signatureHashArray, callback) {
    var queryStr = 'SELECT * FROM diffs WHERE users_dashboards_signature_hash=?' +
      ' or users_dashboards_signature_hash=?'.repeat(signatureHashArray.length - 1);
    pool.query(queryStr, signatureHashArray, function (err, results) {
      callback(err, results);
    });
  }
});
