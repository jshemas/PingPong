'use strict';
/* App Module */

angular.module('arena', []).
	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
	when('/matches', {
			templateUrl: 'partials/match-list.html',
			controller: MatchListCtrl
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
		otherwise({redirectTo: '/matches'});
	//$locationProvider.html5Mode(true); // Use HTML5 strategy if available for how application deep linking paths are stored
}]);
