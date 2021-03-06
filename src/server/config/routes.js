/*jslint node: true */
"use strict";

var helpers = require('./helpers.js');

// request handlers
var dashboards = require('../request-handlers/dashboards');
var dashboardsOrgRepo = require('../request-handlers/dashboards-org-repo');
var setup = require('../request-handlers/setup');
var commits = require('../request-handlers/commits');
var dashboardsDashboardId = require('../request-handlers/dashboards-dashboardId');
var repos = require('../request-handlers/repos.js');

module.exports = function (app) {
  // Interact with dashboards
  app.post('/api/dashboards/', dashboards.handlePost); // for when user joins and/or creates a dashboard from #/add
  app.get('/api/dashboards/', dashboards.handleGet); // for displaying all dashboards user has already joined, on #/home
  app.get('/api/dashboards/:orgName/:repoName', dashboardsOrgRepo.handleGet); // for getting all information needed to render a particular #/:orgName/:repoName dashboard
  app.delete('/api/dashboards/:dashboardId', dashboardsDashboardId.handleDelete); // for when user removes themselves from a dashboard by clicking x on #/

  // Get signature hash for setup page
  app.get('/api/setup/:orgName/:repoName', setup.handleGet);

  // 'Commit' interaction
  app.post('/api/commits/', commits.handlePost);

  // Get user GitHub Subscriptions
  app.get('/api/repos/', repos.handleGet);
  app.post('/api/repos/', repos.handlePost);

  // Error handling
  app.use(helpers.errorLogger);
  app.use(helpers.errorHandler);
};
