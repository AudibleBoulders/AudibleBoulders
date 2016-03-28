"use strict";
angular.module('add', [])
.controller('AddController', ['$scope', 'RequestFactory', '$http', 'Socket', '$location', '$timeout',function($scope, RequestFactory, $http, Socket, $location, $timeout){
  $scope.subsc = [];
  $scope.loading = true;
  var linked = [];
  var first;
  var prev;
  var next;
  var last;

  // Function to parse page information
  var linkParse = function(linkBody) {
    var regLink = [];
    var splitLink = linkBody.split(' ');
    var pattern = /(<|>;|,|"|rel=)/ig;
    for(var i = 0; i < splitLink.length; i++) {
      regLink.push(splitLink[i].replace(pattern, ""));
    }
    console.log('Links: ', regLink);
    regLink.forEach(function(item, index){
      if(index % 2 !== 0){
        if(item === 'next'){
          console.log('Assign Link! ', item);
          next = {link:regLink[index-1]};
          console.log('assigned link: ', next);
        } else if(item === 'last') {
          console.log('Assign Link! ', item);
          last={link:regLink[index-1]};
          console.log('assigned link: ', last);
        } else if(item === 'first') {
          console.log('Assign Link! ', item);
          first={link:regLink[index-1]};
          console.log('assigned link: ', first);
        } else if(item === 'prev') {
          console.log('Assign Link! ', item);
          prev={link:regLink[index-1]};
          console.log('assigned link: ', prev);
        }
      }
    });
  };
  // Function to get next page of results
  var pagePost = function(url) {
    $http({
      method: 'POST',
      url: '/api/repos/',
      data: url
    }).then(function (res){
      linked = res.data.headers.link;
      linkParse(linked);
      $scope.subsc = [];
      $scope.subsc = JSON.parse(res.data.body);
    });
  };
  // Function to check which page button was pressed
  $scope.pages = function(page){
    if(page === 'first'){
      if(first !== undefined) {
        pagePost(first);
      } else {
        window.alert("You are on the First Page");
      }
      console.log('');
    } else if(page === 'prev'){
      if(prev !== undefined) {
        pagePost(prev);
      } else {
        window.alert("You are on the First Page");
      }
    } else if(page === 'next'){
      if(next !== undefined) {
        pagePost(next);
      } else {
        window.alert("You are on the Last Page");
      }
      console.log('Next Page: ', next);
    } else if(page === 'last'){
      if(last !== undefined) {
        pagePost(last);
      } else {
        window.alert("You are on the Last Page");
      }
      console.log('Last Page: ', last);
    } else {

    }
  };

  $http({
    method: 'GET',
    url: '/api/subscriptions'
  }).then(function (res){
    $scope.loading = false;
    linked = res.data.headers.link;
    if(linked !== undefined){
      linkParse(linked);
    }
    console.log('Any Links? ',linked);
    $scope.subsc = JSON.parse(res.data.body);
  });

  var emitJoinDash = function (repoObject) {
    var dashPath = repoObject.full_name;
    Socket.emit('newJoin', {
    });
    $location.path(dashPath);
  };

  $scope.postDashboard = function (repoObject) {
    var dashboardInfo = {org_name: repoObject.owner.login, repo_name: repoObject.name};
    RequestFactory.postDashboard(dashboardInfo)
    .then(function () {
      emitJoinDash(repoObject);
    });
  };
}]);
