'use strict';
/* Controllers */

function MatchListCtrl($scope, $http, $location, $route, $rootScope, alertService) {
	$scope.title = "Matches Played";
	$rootScope.title = "Matches Played";
	$scope.predicate = '-createdDate';

	$http.get('/matches/json').success(function(data) {
		$scope.matches = data;
	});
	$http.get('/users/json').success(function(data) {
		$scope.players = data.players;
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
			if(data.success == true){
				$route.reload();
			} else {
				if(data.error && data.error == 'same player ID'){
					alertService.add("error", "You can't play against yourself!");
				} else {
					alertService.add("error", "Something Wrong!");
				}
			};
		});
	};
	
	$scope.badgeColor = function(main, compare) {
		return main > compare ? "badge-success" : "badge-important";
	};
};

function MatchDeleteListCtrl($scope, $http, $location, $route, $rootScope) {
	$scope.title = "Deleted Matches Played";
	$rootScope.title = "Deleted Matches Played";
	$scope.predicate = '-createdDate';

	$http.get('/matches/delList/json').success(function(data) {
		$scope.matches = data;
	});
	$http.get('/users/json').success(function(data) {
		$scope.players = data;
	});
	$scope.badgeColor = function(main, compare) {
		return main > compare ? "badge-success" : "badge-important";
	};
};

function MatchTeamListCtrl($scope, $http, $location, $route, $rootScope, alertService) {
	$scope.title = "Team Matches Played";
	$rootScope.title = "Team Matches Played";
	$scope.predicate = '-createdDate';

	$http.get('/matches/json?team=true').success(function(data) {
		$scope.matches = data;
	});
	$http.get('/teams/json').success(function(data) {
		console.log("data",data)
		$scope.teams = data.teams;
	});

	$scope.master = {
		game1RedPlayer: 11,
		game1BluePlayer: 11,
		game2RedPlayer: 11,
		game2BluePlayer: 11
	};
	$scope.form = angular.copy($scope.master);

	$scope.reset = function() {
		$scope.teams = angular.copy($scope.master);
	};

	$scope.addMatch = function () {
		$scope.form.team = true;
		$http.post('/matches', $scope.form).success(function(data) {
			if(data.success == true){
				$route.reload();
			} else {
				if(data.error && data.error == 'same player ID'){
					alertService.add("error", "You can't play against yourself!");
				} else {
					alertService.add("error", "Something Wrong!");
				}
			};
		});
	};
	
	$scope.badgeColor = function(main, compare) {
		return main > compare ? "badge-success" : "badge-important";
	};
};

function MatchTeamDeleteListCtrl($scope, $http, $location, $route, $rootScope) {
	$scope.title = "Deleted Matches Played";
	$rootScope.title = "Deleted Matches Played";
	$scope.predicate = '-createdDate';

	$http.get('/matches/delList/json?team=true').success(function(data) {
		$scope.matches = data;
	});
	$http.get('/users/json').success(function(data) {
		$scope.players = data;
	});
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
		$http.get('/matches/' + $scope.matchId + '/delete').success(function(data) {
			console.log("Match removed");
			$location.path( "/matches" );
			$http.get('/matches/rebuildRatings').success(function(data){
				console.log('ratings recalculated');
			});
		});
	};
	
	$scope.badgeColor = function(main, compare) {
		return main > compare ? "badge-success" : "badge-important";
	};
};

function PlayerListCtrl($scope, $http, $location, $route) {
	$scope.title = "Players"
	$http.get('/users/json').success(function(data) {
		$scope.players = data.players;
		if (! data.Success) $scope.error = data["Error"];
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
		if (data.Success) {
			$scope.userData = data.player;
			$scope.title = data.player.displayName;
		} else $scope.error = data["Error"];
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

function TeamListCtrl($scope, $http, $location, $route) {
	$scope.title = "Teams"
	$http.get('/matches/json').success(function(data) {
		$scope.matches = data;
	});
	$http.get('/users/json').success(function(data) {
		$scope.players = data.players;
	});
	$http.get('/teams/json').success(function(data) {
		$scope.teams = data.teams;
		if (! data.Success) $scope.error = data["Error"];
	});

	$scope.form = {};
	$scope.addTeam = function () {
		$http.post('/teams', $scope.form).success(function(data) {
			$route.reload();
		});
	};
	$scope.predicate = '-rating';
};

function TeamDetailCtrl($scope, $routeParams, $http, $location) {
	$scope.teamId = $routeParams.teamId;
	$scope.predicate = '-createdDate';

	$http.get('/teams/' + $scope.teamId + '/json').success(function(data) {
		if (data.Success) {
			$scope.teamData = data.team;
			$scope.title = data.team.teamName;
		} else $scope.error = data["Error"];
	});

	$http.get('/matches/json?playerID=' + $scope.teamId + '&team=true').success(function(data) {
		$scope.matchData = data;
	});

	$scope.deleteTeam = function () {
		$('#removeTeamConfirmation').modal('hide')
		$http.get('/teams/' + $scope.teamId + '/delete').success(function(data) {
			$location.path( "/teams" );
		});
	};

	$scope.editTeam = function (team) {
		$.extend($scope.teamData, team);
		$http.put('/teams/' + $scope.teamId + '/edit', {"id": $scope.teamId, "data": team}).success(function(data) {
			$('#editTeamDialog').modal('hide');
		});
	};

	$scope.showRemoveTeam = function(){
		$('#removeTeamConfirmation').modal({})
	};

	$scope.showEditTeam = function(){
		$('#editTeamDialog').modal({});
	};
	
	$scope.badgeColor = function(main, compare) {
		return main > compare ? "badge-success" : "badge-important";
	};
};

function RootCtrl($rootScope, $location, alertService) {
	$rootScope.changeView = function(view) {
		$location.path(view);
	};
	// root binding for alertService
	$rootScope.closeAlert = alertService.closeAlert; 
}
RootCtrl.$inject = ['$scope', '$location', 'alertService'];
