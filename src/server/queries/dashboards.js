"use strict";

var pool = require('../db/index.js');

module.exports = {
  // NOTE: by "return", we really mean "pass to callback as results arg"

  getOne: function (orgName, repoName, callback) {
    // return dashboard object (with all fields) or null if none
    pool.getConnection(function (err, connection) {
      if (err) {
        throw new Error(err);
      }
      var selectStr = "SELECT * FROM dashboards WHERE org_name='" + orgName + "' AND repo_name='" + repoName + "';";
      connection.query(selectStr, function (err, results) {
        var dashboardObject = (results && results.length > 0) ? results[0] : null;
        callback(err, dashboardObject);
        connection.release();
      });
    });
  },
  getAllByGithubId: function (githubId, callback) {
    // return an array of all dashboard objects (with all fields) associated with github_id
    pool.getConnection(function (err, connection) {
      if (err) {
        throw new Error(err);
      }
      var selectStr = "SELECT dashboards.id, org_name, repo_name, branch_name, last_commit_sha1, last_commit_msg FROM users_dashboards INNER JOIN dashboards ON users_dashboards.dashboards_id=dashboards.id WHERE users_github_id='" + githubId + "';";
      connection.query(selectStr, function (err, results) {
        callback(err, results);
        connection.release();
      });
    });
  },
  updateLastCommit: function (orgName, repoName, newSha1, newMsg, callback) {
    // no return value
    pool.getConnection(function (err, connection) {
      if (err) {
        throw new Error(err);
      }
      var updateStr = "UPDATE dashboards SET last_commit_sha1='" + newSha1 + "', last_commit_msg='" + newMsg + "' WHERE org_name='" + orgName + "' AND repo_name='" + repoName + "';";
      connection.query(updateStr, function (err, results) {
        if (callback) {
          callback(err, results);
        }
        connection.release();
      });
    });
  },
  findOrCreate: function (orgName, repoName, callback) {
    // return id and a bool for whether it was a find or a create
    // e.g. {dashboards_id: 1234, isNewDashboard: true}

    // call getOne to see if dashboard already exists
    module.exports.getOne(orgName, repoName, function (err, dashboardObject) {
      if (err) {
        callback(err, null);
      } else if (dashboardObject) {
        // dashboard DOES exist - pass its id to callback, with false bool for isNewDashboard
        callback(null, {dashboards_id: dashboardObject.id, isNewDashboard: false});
      } else {
        // dashboard DOES NOT exist - create a new dashboard entry
        pool.getConnection(function (err, connection) {
          if (err) {
            throw new Error(err);
          }
          // TODO: eventually, we will pass in branchName as an arg and use that, for now default to master
          var branchName = "master";
          var insertStr = "INSERT INTO dashboards (org_name, repo_name, branch_name) VALUES ('" + orgName + "', '" + repoName + "', '" + branchName + "');";
          connection.query(insertStr, function (err, results) {
            if (err) {
              callback(err, null);
            } else {
              var dashboards_id = results.insertId;
              callback(null, {dashboards_id: dashboards_id, isNewDashboard: true});
            }
            connection.release();
          });
        });
      }
    });
  }
};
