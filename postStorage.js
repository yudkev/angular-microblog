/*global angular */

/**
 * Services that persists and retrieves blog posts from localStorage or a backend API
 * if available.
 */
angular.module('postmvc')
	.factory('postStorage', function ($http, $injector) {
		'use strict';

		// Detect if an API backend is present. If so, return the API module, else
		// hand off the localStorage adapter
		return $http.get('/api')
			.then(function () {
				return $injector.get('api');
			}, function () {
				return $injector.get('localStorage');
			});
	})

	.factory('api', function ($resource) {
		'use strict';

		var store = {
			posts: [],

			api: $resource('/api/posts/:id', null,
				{
					update: { method:'PUT' }
				}
			),

			delete: function (post) {
				var originalPosts = store.posts.slice(0);

				store.posts.splice(store.posts.indexOf(post), 1);
				return store.api.delete({ id: post.id },
					function () {
					}, function error() {
						angular.copy(originalPosts, store.posts);
					});
			},

			get: function () {
				return store.api.query(function (resp) {
					angular.copy(resp, store.posts);
				});
			},

			insert: function (post) {
				var originalPosts = store.posts.slice(0);

				return store.api.save(post,
					function success(resp) {
						post.id = resp.id;
						store.posts.push(post);
					}, function error() {
						angular.copy(originalPosts, store.posts);
					})
					.$promise;
			},

			insert: function (staticPost) {
				var originalStaticPosts = store.staticPosts.slice(0);

				return store.api.save(post,
					function success(resp) {
						staticPost.id = resp.id;
						store.staticPosts.push(staticPost);
					}, function error() {
						angular.copy(originalStaticPosts, store.staticPosts);
					})
					.$promise;
			},

			put: function (post) {
				return store.api.update({ id: post.id }, post)
					.$promise;
			}
		};

		return store;
	})

	.factory('localStorage', function ($q) {
		'use strict';

		var STORAGE_ID = 'posts-angularjs';

		var store = {
			posts: [],

			_getFromLocalStorage: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

			_saveToLocalStorage: function (posts) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(posts));
			},

			_saveToLocalStorageStatic: function (staticPosts) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(staticPosts));
			},

			delete: function (post) {
				var deferred = $q.defer();

				store.posts.splice(store.posts.indexOf(post), 1);

				store._saveToLocalStorage(store.posts);
				deferred.resolve(store.posts);

				return deferred.promise;
			},

			get: function () {
				var deferred = $q.defer();

				angular.copy(store._getFromLocalStorage(), store.posts);
				deferred.resolve(store.posts);

				return deferred.promise;
			},

			insert: function (post) {
				var deferred = $q.defer();

				store.posts.push(post);

				store._saveToLocalStorage(store.posts);
				deferred.resolve(store.posts);

				return deferred.promise;
			},

			// insertStatic: function (staticPost) {
			// 	var deferred = $q.defer();

			// 	store.staticPosts.push(staticPost);

			// 	store._saveToLocalStorage(store.staticPosts);
			// 	deferred.resolve(store.staticPosts);

			// 	return deferred.promise;
			// },

			put: function (post, index) {
				var deferred = $q.defer();

				store.posts[index] = post;

				store._saveToLocalStorage(store.posts);
				deferred.resolve(store.posts);

				return deferred.promise;
			}
		};

		return store;
	});
