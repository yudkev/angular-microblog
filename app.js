/*global angular */

angular.module('postmvc', ['ngRoute', 'ngResource', 'ngSanitize', 'angularMoment', 'angular.filter'])
	.config(function ($routeProvider) {
		'use strict';

		var routeConfig = {
			controller: 'PostCtrl',
			templateUrl: 'index.html',
			resolve: {
				store: function (postStorage) {
					// Get the correct module (API or localStorage).
					return postStorage.then(function (module) {
						module.get();
						return module;
					});
				}
			}
		};

		$routeProvider
			.when('/', routeConfig)
			.when('/:status', routeConfig)
			.otherwise({
				redirectTo: '/'
			});
	});


