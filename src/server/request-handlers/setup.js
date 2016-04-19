"use strict";

var users_dashboards = require('../queries/users_dashboards.js');
var dashboards = require('../queries/dashboards.js');

module.exports = {
  handleGet: function (req, res, next) {
    var orgName = req.params.orgName;
    var repoName = req.params.repoName;
    var githubId = req.cookies.githubId;
    var responseObject = {};

    dashboards.getOneAsync(orgName, repoName)
      .then(function(dashboard) {
        return users_dashboards.getOneAsync(githubId, dashboard.id);
      })
      .then(function(users_dashboards_object) {
        responseObject.signature_hash = users_dashboards_object.signature_hash;
        res.json(responseObject);
      })
      .catch(function(e) {
        console.log("Error: ", e);
        res.sendStatus(400);
      });
  }
};
