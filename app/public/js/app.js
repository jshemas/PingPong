'use strict';
/* App Module */

angular.module('arena', ['PingPongFilters', 'Services']).
	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
	when('/matches', {
			templateUrl: 'partials/match-list.html',
			controller: MatchListCtrl
		}).
		when('/matchesDelete', {
			templateUrl: 'partials/match-list.html',
			controller: MatchDeleteListCtrl
		}).
		when('/matches/:matchId', {
			templateUrl: 'partials/match-detail.html',
			controller: MatchDetailCtrl
		}).
		when('/players', {
			templateUrl: 'partials/users-list.html',
			controller: PlayerListCtrl
		}).
		when('/players/:userId', {
			templateUrl: 'partials/users-detail.html',
			controller: PlayerDetailCtrl
		}).
		when('/updates', {
			templateUrl: 'partials/recent-updates.html'
		}).
		when('/teamMatches', {
			templateUrl: 'partials/team-match-list.html',
			controller: MatchTeamListCtrl
		}).
		when('/teamMatchesDelete', {
			templateUrl: 'partials/match-list.html',
			controller: MatchDeleteListCtrl
		}).
		when('/teamMatches/:matchId', {
			templateUrl: 'partials/match-detail.html',
			controller: MatchDetailCtrl
		}).
		when('/teams', {
			templateUrl: 'partials/team-list.html',
			controller: TeamListCtrl
		}).
		when('/teams/:teamId', {
			templateUrl: 'partials/team-detail.html',
			controller: TeamDetailCtrl
		}).
		otherwise({redirectTo: '/matches'});
	//$locationProvider.html5Mode(true); // Use HTML5 strategy if available for how application deep linking paths are stored
}]);
