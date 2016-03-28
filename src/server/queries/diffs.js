/*jshint loopfunc: true */
"use strict";

var pool = require('../db/index.js').getPool();
var promise = require('bluebird');

// NOTE: when using the methods in this module, append "Async" to the end of the method name
var diffs = module.exports = promise.promisifyAll({
  // NOTE: by "return", we really mean "pass to callback as results arg"

  deleteAll: function (signatureHash, callback) {
    // delete all records from diffs that have a matching users_dashboards_signature_hash
    // no return value
    var deleteStr = "DELETE FROM diffs WHERE users_dashboards_signature_hash='" + signatureHash + "';";
    pool.query(deleteStr, function (err, results) {
      callback(err, "Diffs deleted");
    });
  },
  addAll: function (signatureHash, diffsArray, callback) {
    // go through diffsArray and add a new record in diffs table for each, with users_dashboards_signature_hash set to signatureHash
    // no return value
    var counter = {diffsInserted: 0};
    // we use counter to determine when all diffs have been successfully inserted, so that we can invoke the callback at that point
    // counter is an object instead of a number so that it will be mutable
    // i.e. if the counter object changes in one asychronous query, it will also be changed in the other queries
    for (var i = 0; i < diffsArray.length; i++) {
      var diffObject = diffsArray[i];
      var insertStr = "INSERT INTO diffs (file, mod_type, users_dashboards_signature_hash) VALUES ('" + diffObject.file + "', '" + diffObject.mod_type + "', '" + signatureHash + "');";
      pool.query(insertStr, function (err, results) {
        if (err) {
          callback(err, null);
        } else {
          counter.diffsInserted++;
          if (counter.diffsInserted === diffsArray.length) {
            callback(null, "Diffs inserted");
          }
        }
      });
    }
  },
  getAll: function (signatureHash, callback) {
    // return an array of diff objects that have a matching users_dashboards_signature_hash
    var selectStr = "SELECT * FROM diffs WHERE users_dashboards_signature_hash='" + signatureHash + "';";
    pool.query(selectStr, function (err, results) {
      callback(err, results);
    });
  }
});
