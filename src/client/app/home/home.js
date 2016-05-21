"use strict";
angular.module('home', [])
.controller('HomeController', ['$scope', 'RequestFactory', 'AuthFactory', '$cookies', 'Socket', function ($scope, RequestFactory, AuthFactory, $cookies, Socket) {
  $scope.empty = false;
  $scope.loading = true;
  var githubId = $cookies.get('githubId');
  var isEmpty = function() {
    if ($scope.dashboards.length === 0) {
        $scope.empty = true;
    }
  };

  var emitRemovedDash = function (dashboard) {
    Socket.emit('removeDash', dashboard);
  };

  $scope.removeUserDashboard = function(index) {
    var dashboardId = $scope.dashboards[index].id;
    $scope.dashboards.splice(index, 1);
    isEmpty();
    RequestFactory.deleteUserDashboard(dashboardId)
    .then(function () {
      emitRemovedDash({githubId: githubId, dashboardId: dashboardId});
    });
  };

  var initializeDashboardList = function() {
    RequestFactory.getAllDashboards()
    .then(function (dashboards) {
      $scope.loading = false;
      $scope.dashboards = dashboards;
      isEmpty();
    });
  };

  initializeDashboardList();
}]);
