/******************************************************************************\
|                                                                              |
|                                    project.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a SWAMP project.                              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/registry',
	'scripts/models/utilities/timestamped'
], function($, _, Config, Registry, Timestamped) {
	return Timestamped.extend({

		//
		// attributes
		//

		defaults: {
			'full_name': undefined,
			'short_name': undefined,
			'project_type_code': undefined,
			'affiliation': undefined,
			'description': undefined
		},

		projectTypeCodes: [
			'SW_DEV',
			'TESTING_TOOL',
			'EDU',
			'RESEARCH'
		],

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/projects',

		//
		// methods
		//

		projectTypeCodeToStr: function(projectTypeCode) {
			switch (projectTypeCode) {
				case 'SW_DEV':
					return 'Software Development';
				case 'TESTING_TOOL':
					return 'Testing Tool';
				case 'EDU':
					return 'Education';
				case 'RESEARCH':
					return 'Research';
            }
		},

		//
		// querying methods
		//

		getName: function() {
			if (!this.isTrialProject()) {
				return this.get('short_name');
			} else {
				return '';
			}
		},

		getProjectTypeStr: function() {
			return this.projectTypeCodeToStr(this.get('project_type_code'));
		},

		isDeactivated: function() {
			return (this.has('deactivation_date') || this.hasDeleteDate());
		},

		isTrialProject: function() {
			return (this.has('trial_project_flag') && this.get('trial_project_flag') == '1');
		},

		isSameAs: function(project) {
			if (project) {
				return this.get('project_uid') == project.get('project_uid')
			} else {
				return false;
			}
		},

		//
		// ownership methods
		//

		isOwned: function() {
			return this.isOwnedBy(Registry.application.session.user);		
		},

		isOwnedBy: function(user) {
			var isOwnedBy = false;
			if (user) {
				if (this.has('project_owner_uid')) {
					isOwnedBy = (this.get('project_owner_uid') === user.get('user_uid'));
				} else if (this.has('owner')) {
					isOwnedBy = (this.get('owner').email === user.get('email'));
				}
			}
			return isOwnedBy;
		},

		//
		// admin status methods
		//

		getStatus: function() {
			return this.isDeactivated() ? 'deactivated' : 'activated';
		},

		setStatus: function(status) {
			switch (status) {
				case 'deactivated':
					this.set({
						deactivation_date: new Date()
					});
					break;
				case 'activated':
					this.set({
						deactivation_date: null
					});
					break;
			}
		},

		//
		// ajax methods
		//

		deleteCurrentMember: function(options) {
			this.deleteMember(Registry.application.session.user, options);
		},

		deleteMember: function(member, options) {
			$.ajax(_.extend(options, {
				url: Config.registryServer + '/memberships/projects/' + this.get('project_uid') + '/users/' + member.get('user_uid'),
				type: 'DELETE'
			}));
		},

		fetchProjectConfirmation: function(options) {
			options.url = this.urlRoot + '/' + this.get('project_uid') + '/confirm'; 
			return Backbone.Model.prototype.fetch.call( this, options );
		},

		fetchTrialByUser: function(user, options) {
			return $.ajax(_.extend(options, {
				url: Config.registryServer + '/users/' + user.get('user_uid') + '/projects/trial/',
				type: 'GET',
				dataType: 'json'
			}));
		},

		fetchCurrentTrial: function(options) {
			this.fetchTrialByUser(Registry.application.session.user, options);
		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('project_uid'));
		},

		isNew: function() {
			return !this.has('project_uid');
		},

		parse: function(response) {

			// call superclass method
			//
			response = Timestamped.prototype.parse.call(this, response);

			// convert dates from strings to objects
			//
			if (response.deactivation_date) {
				response.deactivation_date = new Date(Date.parseIso8601(response.deactivation_date));
			}

			return response;
		}
	});
});
