'use strict';
/* Controllers */

function MatchListCtrl($scope, $http, $location, $route) {
	$scope.title = "Matches Played";
	$http.get('/matches/json').success(function(data) {
		//console.log(data);
		$scope.matches = data;
	});
	$http.get('/users/json').success(function(data) {
		//console.log(data);
		$scope.players = data;
	});

	$scope.form = {};
	$scope.addMatch = function () {
		$http.post('/matches', $scope.form).success(function(data) {
			//console.log("SUCCESS!", data);
			//$location.path('/players');
			$route.reload();
		});
	};

	//$scope.orderProp = 'played_date'; TODO: We need to save the date played
}

function MatchDetailCtrl($scope, $routeParams, $http) {
	$scope.title = "Match Details";
	$scope.matchId = $routeParams.matchId;
	$http.get('/matches/' + $scope.matchId + '/json').success(function(data) {
		//console.log("Match Data", data);
		$scope.matchData = data;
	});
}

function PlayerListCtrl($scope, $http, $location, $route) {
	$scope.title = "Players"
	$http.get('/users/json').success(function(data) {
		//console.log(data);
		$scope.players = data;
	});
	$scope.predicate = '-ratio';

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

function PlayerDetailCtrl($scope, $routeParams, $http, $location) {
	//console.log("Route Params", $routeParams);
	$scope.userId = $routeParams.userId;
	$http.get('/users/' + $scope.userId + '/json').success(function(data) {
		//console.log("user Data", data);
		$scope.userData = data;
		$scope.title = data.fname;
	});

	$http.get('/matches/json?playerID=' + $scope.userId).success(function(data) {
		//console.log("Match Data", data);
		$scope.matchData = data;
		console.log("MatchData", $scope.matchData);
	});

	$scope.deletePlayer = function () {

		$('#removePlayerConfirmation').modal('hide')
		$http.get('/users/' + $scope.userId + '/delete').success(function(data) {
			//console.log("SUCCESS!", data);
			//$location.path('/players');
			$location.path( "/players" );

		});
	};

	$scope.editPlayer = function (user) {
		//$scope.userData.fname = user.firstName;
		$.extend($scope.userData, user);
		$http.put('/users/' + $scope.userId + '/edit', {"id": $scope.userId, "data": user}).success(function(data) {
			$('#editPlayerDialog').modal('hide');
		});
	};

	$scope.showRemovePlayer = function(){
		$('#removePlayerConfirmation').modal({})
	}

	$scope.showEditPlayer = function(){
		$('#editPlayerDialog').modal({});
	}
}
