'use strict';

/* Controllers */

function GameListCtrl($scope, $http) {
	$http.get('/games/json').success(function(data) {
		console.log(data);
		$scope.games = data;
	});

	//$scope.orderProp = 'played_date'; TODO: We need to save the date played
}

function GameDetailCtrl($scope, $routeParams) {
	$scope.gameId = $routeParams.gameId;
}