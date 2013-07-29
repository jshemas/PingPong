'use strict';

/* Controllers */

function GameListCtrl($scope, $http) {
	$scope.title = "Games Played";
	$http.get('/games/json').success(function(data) {
		console.log(data);
		$scope.games = data;
	});

	//$scope.orderProp = 'played_date'; TODO: We need to save the date played
}

function GameDetailCtrl($scope, $routeParams, $http) {
	$scope.title = "Game Details";
	$scope.gameId = $routeParams.gameId;
	$http.get('/games/' + $scope.gameId + '/json').success(function(data) {
		console.log("Game Data", data);
		$scope.gameData = data;
	});
}

function PlayerListCtrl($scope, $http) {
	$scope.title = "Players"
	$http.get('/users/json').success(function(data) {
		console.log(data);
		$scope.players = data;

	});

	//$scope.orderProp = 'played_date'; TODO: We need to save the date played
}

function PlayerDetailCtrl($scope, $routeParams, $http) {
	console.log("Route Params", $routeParams);
	$scope.userId = $routeParams.userId;
	$http.get('/users/' + $scope.userId + '/json').success(function(data) {
		console.log("user Data", data);
		$scope.userData = data;
		$scope.title = data.fname;
	});
}