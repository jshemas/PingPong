'use strict';
/* Controllers */

function GameListCtrl($scope, $http, $location, $route) {
	$scope.title = "Games Played";
	$http.get('/games/json').success(function(data) {
		//console.log(data);
		$scope.games = data;
	});
	$http.get('/users/json').success(function(data) {
		//console.log(data);
		$scope.players = data;
	});

	$scope.form = {};
	$scope.addGame = function () {
		$http.post('/games', $scope.form).success(function(data) {
			//console.log("SUCCESS!", data);
			//$location.path('/players');
			$route.reload();
		});
	};

	//$scope.orderProp = 'played_date'; TODO: We need to save the date played
}

function GameDetailCtrl($scope, $routeParams, $http) {
	$scope.title = "Game Details";
	$scope.gameId = $routeParams.gameId;
	$http.get('/games/' + $scope.gameId + '/json').success(function(data) {
		//console.log("Game Data", data);
		$scope.gameData = data;
	});
}

function PlayerListCtrl($scope, $http, $location, $route) {
	$scope.title = "Players"
	$http.get('/users/json').success(function(data) {
		//console.log(data);
		$scope.players = data;
	});
	$scope.form = {};
	$scope.addPlayer = function () {
		$http.post('/users', $scope.form).success(function(data) {
			//console.log("SUCCESS!", data);
			//$location.path('/players');
			$route.reload();
		});
	};

	//$scope.orderProp = 'played_date'; TODO: We need to save the date played
}

function PlayerDetailCtrl($scope, $routeParams, $http) {
	//console.log("Route Params", $routeParams);
	$scope.userId = $routeParams.userId;
	$http.get('/users/' + $scope.userId + '/json').success(function(data) {
		//console.log("user Data", data);
		$scope.userData = data;
		$scope.title = data.fname;
	});
}
