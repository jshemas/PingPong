'use strict';

/* Controllers */

function GameListCtrl($scope, $http) {
	$http.get('/games/json').success(function(data) {
		console.log(data);
		$scope.games = data;
	});

	//$scope.orderProp = 'played_date'; TODO: We need to save the date played
}

function GameDetailCtrl($scope, $routeParams, $http) {

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
