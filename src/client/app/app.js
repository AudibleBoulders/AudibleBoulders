"use strict";
angular.module('GitSpy', [
  'add', 'dashboard', 'home', 'login', 'setup', 'ngRoute', 'helper'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/app/home/home.html',
    controller: 'HomeController'
  });
  $routeProvider.when('/login',{
    templateUrl: 'app/login/login.html',
    controller: 'LoginController'
  });
  $routeProvider.when('/add', {
    templateUrl: 'app/add/add.html',
    controller: 'AddController'
  });
  $routeProvider.when('/:orgName/:repoName', {
    templateUrl: 'app/dashboard/dashboard.html',
    controller: 'DashboardController'
  });
  $routeProvider.when('/:orgName/:repoName/setup', {
    templateUrl: 'app/setup/setup.html',
    controller: 'SetupController'
  });
  $routeProvider.otherwise({redirectTo: '/'});
}]);
