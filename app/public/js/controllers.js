'use strict';
/* Controllers */

function MatchListCtrl($scope, $http, $location, $route, $rootScope) {
	$scope.title = "Matches Played";
	$rootScope.title = "Matches Played";
	$scope.predicate = '-createdDate';

	$http.get('/matches/json').success(function(data) {
		$scope.matches = data;
	});
	$http.get('/users/json').success(function(data) {
		$scope.players = data;
	});

	$scope.master = {
		game1RedPlayer: 11,
		game1BluePlayer: 11,
		game2RedPlayer: 11,
		game2BluePlayer: 11
	};
	$scope.form = angular.copy($scope.master);

	$scope.reset = function() {
		$scope.user = angular.copy($scope.master);
	};

	$scope.addMatch = function () {
		$http.post('/matches', $scope.form).success(function(data) {
			$route.reload();
		});
	};
	
	$scope.badgeColor = function(main, compare) {
		return main > compare ? "badge-success" : "badge-important";
	};
};

function MatchDetailCtrl($scope, $routeParams, $http, $location) {
	$scope.title = "Match Details";
	$scope.matchId = $routeParams.matchId;
	$http.get('/matches/' + $scope.matchId + '/json').success(function(data) {
		$scope.matchData = data;
	});

	$scope.deleteMatch = function () {
		$('#removePlayerConfirmation').modal('hide')
		$http.get('/matches/' + $scope.matchId + '/delete').success(function(data) {
			console.log("Match removed");
			$location.path( "/matches" );
		});
	};
	
	$scope.badgeColor = function(main, compare) {
		return main > compare ? "badge-success" : "badge-important";
	};
};

function PlayerListCtrl($scope, $http, $location, $route) {
	$scope.title = "Players"
	$http.get('/users/json').success(function(data) {
		$scope.players = data;
	});

	$scope.form = {};
	$scope.addPlayer = function () {
		$http.post('/users', $scope.form).success(function(data) {
			$route.reload();
		});
	};
	$scope.predicate = '-rating';
};

function PlayerDetailCtrl($scope, $routeParams, $http, $location) {
	$scope.userId = $routeParams.userId;
	$scope.predicate = '-createdDate';

	$http.get('/users/' + $scope.userId + '/json').success(function(data) {
		$scope.userData = data;
		$scope.title = data.fname;
	});

	$http.get('/matches/json?playerID=' + $scope.userId).success(function(data) {
		$scope.matchData = data;
	});

	$scope.deletePlayer = function () {
		$('#removePlayerConfirmation').modal('hide')
		$http.get('/users/' + $scope.userId + '/delete').success(function(data) {
			$location.path( "/players" );
		});
	};

	$scope.editPlayer = function (user) {
		$.extend($scope.userData, user);
		$http.put('/users/' + $scope.userId + '/edit', {"id": $scope.userId, "data": user}).success(function(data) {
			$('#editPlayerDialog').modal('hide');
		});
	};

	$scope.showRemovePlayer = function(){
		$('#removePlayerConfirmation').modal({})
	};

	$scope.showEditPlayer = function(){
		$('#editPlayerDialog').modal({});
	};
	
	$scope.badgeColor = function(main, compare) {
		return main > compare ? "badge-success" : "badge-important";
	};
};
