/*jshint loopfunc: true */
"use strict";

var users = require('../queries/users.js');
var usersDashboards = require('../queries/users_dashboards.js');
var diffs = require('../queries/diffs.js');

module.exports = {
  handleDelete: function(req, res, next) {
    var githubId = req.cookies.githubId;
    var dashboards_id = req.params.dashboardId;

    usersDashboards.getOneAsync(githubId, dashboards_id)
      .then(function (userDashboard) {
        return diffs.getAllFromUsersAsync([userDashboard.signature_hash]);
      })
      .then(function (userDiffs) {
        if (userDiffs.length > 0) {
          return diffs.deleteAllAsync(userDiffs[0].users_dashboards_signature_hash);
        }
      })
      .then(function () {
        return usersDashboards.deleteOneAsync(githubId, dashboards_id);
      })
      .then(function (results) {
        res.send(204);
      })
      .catch(function(e) {
        console.log("Error: ", e);
        res.sendStatus(400);
      });
  }
};
