'use strict';

/* App Module */

angular.module('arena', []).
	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/games', {
			templateUrl: 'partials/game-list.html',
			controller: GameListCtrl
		}).
		when('/games/:gameId', {
			templateUrl: 'partials/game-detail.html',
			controller: GameDetailCtrl
		}).
		when('/players', {
			templateUrl: 'partials/users-list.html',
			controller: PlayerListCtrl
		}).
		when('/players/:userId', {
			templateUrl: 'partials/users-detail.html',
			controller: PlayerDetailCtrl
		}).
		otherwise({redirectTo: '/games'});

	//$locationProvider.html5Mode(true); // Use HTML5 strategy if available for how application deep linking paths are stored

}]);
