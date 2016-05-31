/*jshint loopfunc: true */
"use strict";

var dashboards = require('../queries/dashboards');
var users_dashboards = require('../queries/users_dashboards');
var users = require('../queries/users');
var diffs = require('../queries/diffs');
var github = require('../queries/github');

module.exports = {
  handleGet: function (req, res, next) {
    // This request handler takes the orgname and reponame for a given dashboard and returns everything
    // needed to render that dashboard page
    //
    // Example response object:
    //
    // {
    //   dashboard: {
    //     id: 1,
    //     last_commit_sha1: 'some_git_sha1_sdfasdsdfsdff',
    //     last_commit_msg: 'Merged pull request #27 etc etc'
    //   },
    //   users: [
    //     {
    //       github_id: 1,
    //       github_handle: 'yaliceme',
    //       github_name: 'Alice Yu',
    //       github_avatar: 'profile.jpg',
    //       set_up: 1,
    //       last_pulled_commit_sha1: 'some_sha1_hash_sdfdsfasd',
    //       last_pulled_commit_msg: 'Merged pull request #26 etc etc',
    //       diffs: [
    //         { file: 'file/path/index.html',
    //           mod_type: 'deleted'
    //         }
    //       ]
    //     }
    //   ]
    // }
    var responseObject = {dashboard: {}, users: []};

    var githubId = req.cookies.githubId;
    var orgName = req.params.orgName;
    var repoName = req.params.repoName;

    // commitUrl hardcoded for master branch for now
    var commitUrl = 'https://api.github.com/repos/' + orgName + '/' + repoName + '/commits/master';

    // first check if dashboard exists
    dashboards.getOneAsync(orgName, repoName)
      .then(function (dashboard) {
        if (!dashboard) {
          res.sendStatus(400);
        } else {
          responseObject.dashboard.id = dashboard.id;
          // next check if this user is authorized to view this dashboard
          users_dashboards.getOneAsync(githubId, dashboard.id)
            .then(function (recordObject) {
              if (!recordObject) {
                res.sendStatus(400);
              } else {
                // query github with user token to update last_commit
                users.getOneAsync(githubId)
                  .then(function (user) {
                    var userToken = user.github_token;
                    return github.queryAsync(commitUrl, userToken);
                  })
                  .then(function (commit) {
                    var parsedCommit = JSON.parse(commit.body);
                    var commitSha1 = parsedCommit.sha;
                    var commitMsg = parsedCommit.commit.message;
                    // only use the first line of the commit message
                    commitMsg = commitMsg.indexOf('\n') === -1 ?
                      commitMsg : commitMsg.substring(0, commitMsg.indexOf('\n'));
                    dashboards.updateLastCommitAsync(orgName, repoName, commitSha1, commitMsg);
                    responseObject.dashboard.last_commit_sha1 = commitSha1;
                    responseObject.dashboard.last_commit_msg = commitMsg;
                    // get all users belonging to this dashboard
                    return users.getDashboardUsersAsync(responseObject.dashboard.id);
                  })
                  .then(function (dashboardUsers) {
                    var sigHashArray = dashboardUsers.map(function (dashboardUser) {
                      return dashboardUser.signature_hash;
                    });
                    diffs.getAllFromUsersAsync(sigHashArray)
                      .then(function (diffs) {
                        dashboardUsers.forEach(function (dashboardUser) {
                          var userDiffs = diffs.filter(function (diff) {
                            return dashboardUser.signature_hash === diff.users_dashboards_signature_hash;
                          }).map(function (diff) {
                            return {file: diff.file, mod_type: diff.mod_type};
                          });
                          responseObject.users.push({
                            github_id: dashboardUser.github_id,
                            github_handle: dashboardUser.github_handle,
                            github_name: dashboardUser.github_name,
                            github_avatar: dashboardUser.github_avatar,
                            set_up: dashboardUser.set_up,
                            last_pulled_commit_sha1: dashboardUser.last_pulled_commit_sha1,
                            last_pulled_commit_msg: dashboardUser.last_pulled_commit_msg,
                            commit_branch: dashboardUser.commit_branch,
                            diffs: userDiffs
                          });
                        });
                        res.json(responseObject);
                      });
                  })
                  .catch(function (e) {
                    console.error(e);
                    res.sendStatus(500);
                  });
              }
            })
            .catch(function (e) {
              console.error(e);
              res.sendStatus(500);
            });
        }
      })
      .catch(function (e) {
        console.error(e);
        res.sendStatus(500);
      });
  }
};
