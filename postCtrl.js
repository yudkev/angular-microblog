/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the poststorage service
 * - exposes the model to the template and provides event handlers
 */

angular.module('postmvc')
	.controller('PostCtrl', function PostCtrl($scope, moment, $routeParams, $filter, store) {
		'use strict';

		var posts = $scope.posts = store.posts;		
		var staticPosts = $scope.staticPosts = store.staticPosts;
		var newStaticPosts = [
			{ 
		      	id: 2374237842,
		      	user: 1, 
		      	title: 'Go 3 days without your favorite thing. Then go 3 days without sleep. It turns out sleep is actually your favorite thing.', 
		      	createdAt: 1337774582
		      },{ 
		      	id: 2374272076,
		      	user: 2, 
		      	title: 'If I were in prison, I wouldn\'t ruin my spoon trying to tunnel out, because going without morning yogurt is its own prison.', 
		      	createdAt: 1337968738
		  	}, {
		  		id: 4545435344,
		  		user: 3,
		  		title: 'Driving over the mountains into California on our way home from Canada.',
		  		createdAt: 1461607139
		  	}, {
		  		id: 4629293242,
		  		user: 2,
		  		reply_to: 4545435344,
		  		title: 'Love this shot. Reminds me of the days Logan and I used to wander the streets looking for tourists to frighten.',
		  		createdAt: 1478942943
		  	}
		];
		
		$scope.newPost = '';
		$scope.newComment = '';
		$scope.repostedPost = null;

		$scope.addPost = function () {
			var ts = moment().unix();

			/**
			* Generate unique ID
			*/
			var postID = Math.floor((Math.random()*6131621)+1);
			var user = 4;
			var reply_to = null;

			/**
			* Detect and clean image link, replace with icon,
			* and post it as an attachment image
			*/
			var regex = /(https?:\/\/.*\.(?:png|jpg)).*/gm;
			var urlRegex = /"^\"|\"$", ""/;
			var postContent = $scope.newPost;
			var re = new RegExp(regex);

			if (re.test(postContent)) {
			    var urlTitle = $scope.newPost.replace(regex, function (url) {
                	return '<i class="material-icons attachment-icon">attachment</i>';
            	});
            	var urlLink = $scope.newPost.match(regex, function (link) {
                	return link.replace(urlRegex);
           		});
				var newTitle = urlLink.toString().replace(urlRegex, function (imageLink) {
                	return imageLink;
           		});
			} else {
			    var urlTitle = $scope.newPost;
			}

			var newPost = {
				id: postID,
				user: user,
				reply_to: reply_to,
				title: urlTitle,
				imageURL: newTitle,
				createdAt: ts
			};

			if (!newPost.title) {
				return;
			}

			$scope.saving = true;
			store.insert(newPost)
			.then(function success() {
				$scope.newPost = '';
			})
			.finally(function () {
				$scope.saving = false;
			});
		};

		var staticPosts = [];
		if (!store.posts.length) {
				angular.forEach(newStaticPosts, function(staticPost){
			   	store.posts.push(staticPost);
			});
		};
	
  		$scope.postComment = function (post, replied, event) {
  			if (angular.isDefined(replied)) {
				post.replied = replied;
			}

			/**
			* Assume all reply-posting users are 'you' for now
			*/
			var user = 4;
			var reply_to = null;
			$scope.saveEvent = event;

			/**
			* Check if there's an existing timestamp; replace
			* with Date.now if not
			*/
			var ts = moment().unix(); 
			if (post.reply_to) {
				var createdAt = post.ts;
				var reply_to = post.reply_to;
			} else {
				var reply_to = post.id 
			};

			var newComment = {
				user: post.user,
				id: Math.floor((Math.random()*6131621)+1),
				commentUser: 4,
				createdAt: ts,
				reply_to: reply_to,
				original: $scope.newComment,
				title: this.newCommentTitle,
				imageURL: post.imageURL,
				replied: true
			};

			if (!newComment.title) {
				return;
			}

			store.insert(newComment)
			.then(function success() {
				$scope.newComment = '';  
			})
			.finally(function () {
				// $scope.saving = false; 
			});
		};

		/**
		* Adjust index of comments 
		*/
		$scope.getComment = function (post, replied) {
			var newComments = [];
			angular.forEach(posts, function(p){
				if (post.id == p.reply_to) {
					newComments.push(p);
				};
			});
			return newComments;
		};

		$scope.users = [
			{user: 1, username: 'stevekovach', real_name: 'Steve Kovach', verified: true},
			{user: 2, username: 'ConanOBrien', real_name: 'Conan O\' Brien', verified: true},
			{user: 3, username: 'mike_matas', real_name: 'Mike Matas', verified: false},
		];	

		/**
		* Clear comment field on submit
		*/
		$scope.clearCommentForm = function (post) {
			$scope.newCommentTitle = null;
		};

		$scope.removePost = function (post) {
			store.delete(post);
		};

		$scope.toggleLiked = function (post, liked) {
			if (angular.isDefined(liked)) {
				post.liked = liked;
			}
			store.put(post, posts.indexOf(post))
				.then(function success() {
				}, function error() {
					post.liked = !post.liked;
			});
		};

		$scope.repostPost = function(post, reposted, event){
		 	if (event === 'blur' && $scope.saveEvent === 'submit') {
				$scope.saveEvent = null;
				return;
			}
		 	var timestamp =  moment().unix(); 
    		if (angular.isDefined(reposted)) {
				post.reposted = reposted;
			}
			$scope.saveEvent = event;

			var repostedPost = {
				id: post.id + '1',
				title: post.title,
				createdAt: timestamp,
				originalTs: post.createdAt,
				user: post.user,
				reposted: true,
				imageURL: post.imageURL
			};

			store.insert(repostedPost, posts.indexOf(post), 1)
				.then(function success() {
					$scope.repostedPost = '';
				})
				.finally(function () {
					$scope.saving = false;
				});
  			};
		});

