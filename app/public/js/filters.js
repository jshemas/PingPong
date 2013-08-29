angular.module('PingPongFilters', []).filter('WinLoss', function() {
	return function(input) {
		return (input > 0) ? 'redWins' : 'blueWins';
	};
});
