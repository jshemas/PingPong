'use strict';

/* App Module */

angular.module('arena', []).
	config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/games', {templateUrl: 'partials/game-list.html',   controller: GameListCtrl}).
		when('/games/:gameId', {templateUrl: 'partials/game-detail.html', controller: GameDetailCtrl}).
		otherwise({redirectTo: '/games'});
}]);
