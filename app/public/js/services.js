angular.module('Services', []).factory('alertService', function($rootScope) {
	var alertService = {};
	// create an array of alerts available globally
	$rootScope.alerts = [];
	alertService.add = function(type, msg) {
		$rootScope.alerts.push({'type': type, 'msg': msg});
	};
	alertService.closeAlert = function(index) {
		$rootScope.alerts.splice(index, 1);
	};
	return alertService;
});
