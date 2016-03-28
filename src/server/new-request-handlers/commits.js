/*jshint loopfunc: true */
"use strict";

var users_dashboards = require('../queries/users_dashboards.js');
var diffs = require('../queries/diffs.js');

module.exports = {
  handlePost: function (req, res, next) {
    var signatureHash = req.body.signature_hash;
    var commitDiffs = req.body.diffs;
    var newParams = {
      last_pulled_commit_sha1: req.body.last_pulled_commit_sha1,
      last_pulled_commit_msg: req.body.last_pulled_commit_msg,
      commit_branch: req.body.commit_branch
    };

    users_dashboards.updateOneAsync(signatureHash, newParams)
      .then(function() {
        return diffs.deleteAllAsync(signatureHash);
      })
      .then(function() {
        return diffs.addAllAsync(signatureHash, commitDiffs);
      })
      .then(function() {
        res.sendStatus(201);
      })
      .catch(function(e) {
        console.log("Error: ", e);
      });
  }
};
