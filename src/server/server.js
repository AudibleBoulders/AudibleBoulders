/*jshint loopfunc: true */
"use strict";

/** Create Server and Set Port **/
var PORT = process.env.PORT || 8080; // Set port
var express = require('express');
var app = express();

/** Create DB Connection and Require User Queries**/
var db = module.parent ?
  require('./db').createPool('test', PORT) : require('./db').createPool('app', PORT);

/** Socket Dependencies **/
var http = require('http').Server(app);
var io = require('socket.io')(http);

/** Query files **/
var User = require('./queries/users');
var Diff = require('./queries/diffs');
var Github = require('./queries/github');
var Dashboard = require('./queries/dashboards');
var UserDashboard = require('./queries/users_dashboards');

module.exports = io;
io.on('connect', function (socket) {
  module.exports.socket = socket;
  console.log('Sockets connected!');
  socket.on('disconnect', function () {
    console.log('Sockets disconnected');
  });

  socket.on('newJoin', function (data) {
    var userObject = {};
    var dashboardId;
    var githubId = data.githubId;
    User.getOneAsync(githubId)
      .then(function (user) {
        userObject.github_id = user.github_id;
        userObject.github_handle = user.github_handle;
        userObject.github_name = user.github_name;
        userObject.github_avatar = user.github_avatar;
        return Dashboard.getOneAsync(data.owner.login, data.name);
        })
      .then(function (dashboard) {
        dashboardId = dashboard.id;
        socket.join(dashboardId);
        return UserDashboard.getOneAsync(githubId, dashboardId);
      })
      .then(function (userdashboard) {
        userObject.set_up = userdashboard.set_up;
        userObject.last_pulled_commit_msg = userdashboard.last_pulled_commit_msg;
        userObject.last_pulled_commit_sha1 = userdashboard.last_pulled_commit_sha1;
        var signatureHash = userdashboard.signature_hash;
        return Diff.getAllFromUsersAsync([signatureHash]);
      })
      .then(function (diff) {
        userObject.diffs = diff;
        io.sockets.to(dashboardId).emit('newUser', userObject);
      });
  });

  socket.on('removeDash', function (data) {
    var dashboardId = data.dashboardId;
    socket.join(dashboardId);
    io.sockets.to(dashboardId).emit('removeUser', data);
  });

  socket.on('joinDash', function (data) {
    socket.join(data.dashboardId);
  });

  // socket.on('leaveRooms', function () {
  //   var rooms = io.socket.rooms;
  //   for (var key in rooms) {
  //     socket.leave(rooms[key]);
  //   }
  // });
});

require('./config/middleware.js')(app, express);
require('./config/auth.js')(app);
require('./config/routes.js')(app);

http.listen(PORT, function() {
  console.log('Production Express server running at localhost:' + PORT);
});
