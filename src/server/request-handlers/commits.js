/*jshint loopfunc: true */
"use strict";

var db = require('../db');

module.exports = {
  handlePost: function (req, res, next) {
    var dashboards_id = req.body.dashboards_id;
    var diffs = req.body.diffs;
    var last_pulled_commit = req.body.last_pulled_commit;
    var users_id = req.body.users_id;

    // Find the user/dashboard association to get the id used to reference the diffs for that user
    var findUserDashboards = "SELECT * FROM users_dashboards WHERE users_id='" + users_id.toString() + "' AND dashboards_id='" + dashboards_id + "';";
    db.query(findUserDashboards, function (err, results) {
      if (err) {
        throw new Error(err);
      }
      if (results.length === 0) {
        return;
      } else {
        // Delete all existing diffs for the user for selected dashboard
        var users_dashboards_id = results[0].id;
        var deleteDiffs = "DELETE FROM diffs WHERE users_dashboards_id='" + users_dashboards_id + "';";
        db.query(deleteDiffs, function (err, results) {
          if (err) {
            throw new Error(err);
          }
          // For each diff, create new diff for selected user/dashboard
          for (var i = 0; i < diffs.length; i++) {
            var insertDiff = "INSERT INTO diffs (file, mod_type, commit_message, users_dashboards_id) VALUES ('" + diffs[i].file.toString() + "', '" + diffs[i].mod_type.toString() + "', '" + diffs[i].commit_message.toString() + "', " + users_dashboards_id.toString() + ");";
            db.query(insertDiff, function (err, results) {
              if (err) {
                throw new Error(err);
              }
            });
          }
          // Check dashboard's last commit against user's last pulled commit
          // If the two commits are eq, set up_to_date field to true, else, set to false and update the last_pulled_commit in users_dashboards
          var checkLastCommit = "SELECT * FROM dashboards WHERE id='" + dashboards_id.toString() + "';";
          db.query(checkLastCommit, function (err, results) {
            if (err) {
              throw new Error(err);
            }
            if (results[0].last_commit !== last_pulled_commit) {
              var updateUptodateFalse = "UPDATE users_dashboards SET set_up='1', up_to_date='0', last_pulled_commit='" + last_pulled_commit + "' WHERE users_id='" + users_id.toString() + "' AND dashboards_id='" + dashboards_id.toString() + "';";
              db.query(updateUptodateFalse, function (err, results) {
                if (err) {
                  throw new Error(err);
                }
                res.send(201);
              });
            } else {
              var updateUptodateTrue = "UPDATE users_dashboards SET set_up='1', up_to_date='1', last_pulled_commit='" + last_pulled_commit +"' WHERE users_id='" + users_id.toString() + "' AND dashboards_id='" + dashboards_id.toString() + "';";
              db.query(updateUptodateTrue, function (err, results) {
                if (err) {
                  throw new Error(err);
                }
                res.send(201);
              });
            }
          });
        });
      }
    });
  }
};
