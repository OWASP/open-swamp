/******************************************************************************\
|                                                                              |
|                               build-script-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a (read-only) view of a package version build script.    |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/info/build/build-script/build-script.tpl',
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		unarchiveCommands: {
			'tar': 				'tar xf',
			'tar.gz': 			'tar xzf',
			'tgz': 				'tar xzf',
			'tar.bz2': 			'tar xjf',
			'tar.xz': 			'tar xJf',
			'tar.Z': 			'tar xzf',
			'zip': 				'unzip',
			'jar': 				'jar -xf'
		},

		buildCommands: {
			'ant': 				'ant',
			'ant+ivy': 			'ant',
			'android+ant': 		'ant',
			'maven': 			'mvn',
			'make': 			'make',
			'configure+make':	'make',
			'cmake+make': 		'make',
			'distutils': 		'python',
			'other': 			undefined
		},

		configureCommands: {
			'configure+make':	'configure',
			'cmake+make': 		'cmake'
		},

		//
		// methods to compose build script
		//

		getHighlighted: function(html) {
			return "<span class='highlighted'>" + html + "</span>";
		},

		getUnarchiveCommand: function(packageVersion) {

			function endsWith(str, suffix) {
				return str.indexOf(suffix, str.length - suffix.length) !== -1;
			}

			var filename = packageVersion.getFilename();
			if (filename) {
				for (var fileExtension in this.unarchiveCommands) {
					if (endsWith(filename, fileExtension)) {
						var unarchiveCommand = this.unarchiveCommands[fileExtension];
						return unarchiveCommand + ' ' + filename;
					}
				}
			}
		},

		getConfigureCommand: function(packageVersion) {
			var configureCommand = packageVersion.get('config_cmd');
			var configurePath = packageVersion.get('config_dir');
			var configureOptions = packageVersion.get('config_opt');

			// create default configure command
			//
			if (!configureCommand) {
				var buildSystem = packageVersion.get('build_system');
				configureCommand = this.configureCommands[buildSystem];
			}

			if (configureCommand && configureCommand != '') {

				// add highlighting
				//
				if (this.options.highlight == 'configure-command') {
					configureCommand = this.getHighlighted(configureCommand);
				}

				// add options
				//
				if (configureOptions && configureOptions != '') {

					// add highlighting
					//
					if (this.options.highlight == 'configure-options') {
						configureOptions = this.getHighlighted(configureOptions);
					}

					configureCommand += ' ' + configureOptions;
				}

				// add path
				//
				if (configurePath && configurePath != '') {

					// add highlighting
					//
					if (this.options.highlight == 'configure-path') {
						configurePath = this.getHighlighted(configurePath);
					}

					configureCommand = '(cd ' + configurePath + '; ' + configureCommand + ')';
				}
			}

			return configureCommand;
		},

		getBuildCommand: function(packageVersion) {
			var buildCommand = packageVersion.get('build_cmd');

			// create default build command
			//
			if (!buildCommand || buildCommand === '') {
				var buildSystem = packageVersion.get('build_system');
				buildCommand = this.buildCommands[buildSystem];
			}

			if (buildCommand) {

				// add build file
				//
				var buildFile = packageVersion.get('build_file');
				if (buildFile && buildFile != '') {

					// add highlighting
					//
					if (this.options.highlight == 'build-file') {
						buildFile = this.getHighlighted(buildFile);
					}

					switch (buildCommand) {

						// c/c++ build systems
						//
						case 'make':
						case 'gmake':
							var buildFileOption = '-f ' + buildFile;
							break;

						// java build systems
						//
						case 'ant':
							buildFileOption = '-buildfile ' + buildFile;
							break;

						case 'mvn':
							buildFileOption = ' -filename ' + buildFile;
							break;

						// python build systems
						//
						case 'python':
							buildFileOption = buildFile;

						// other build systems
						//
						default:
							break;
					}
				}

				// add highlighting
				//
				if (this.options.highlight == 'build-command' || this.options.highlight == 'other-build-command') {
					buildCommand = this.getHighlighted(buildCommand);
				}

				// add build file options
				//
				if (buildFileOption) {
					buildCommand += ' ' + buildFileOption;
				}

				// add options
				//
				var buildOptions = packageVersion.get('build_opt');
				if (buildOptions && buildOptions != '') {

					// add highlighting
					//
					if (this.options.highlight == 'build-options') {
						buildOptions = this.getHighlighted(buildOptions);
					}

					buildCommand += ' ' + buildOptions;
				}

				// add target
				//
				var buildTarget = packageVersion.get('build_target');
				if (buildTarget && buildTarget != '') {

					// add highlighting
					//
					if (this.options.highlight == 'build-target' ||
						this.options.highlight == 'other-build-target') {
						buildTarget = this.getHighlighted(buildTarget);
					}

					buildCommand += ' ' + buildTarget;
				}

				// add path
				//
				var buildPath = packageVersion.get('build_dir');
				if (buildPath && buildPath != '') {

					// add highlighting
					//
					if (this.options.highlight == 'build-path') {
						buildPath = this.getHighlighted(buildPath);
					}

					buildCommand = '(cd ' + buildPath + '; ' + buildCommand + ')';
				}
			}
	
			return buildCommand;
		},

		getBuildScript: function(packageVersion) {
			var script = '';
			var newline = '<br />'

			// add unarchive command
			//
			var unarchiveCommand = this.getUnarchiveCommand(packageVersion);
			if (unarchiveCommand) {
				var packageArchive = '<archive>';
				script += unarchiveCommand + ' ' + packageArchive;
				script += newline;
			}

			// add change directory
			//
			var sourcePath = packageVersion.get('source_path');
			if (sourcePath && sourcePath != '') {

				// add highlighting
				//
				if (this.options.highlight == 'package-path') {
					sourcePath = this.getHighlighted(sourcePath);
				}

				// add cd command
				//
				if (sourcePath != '.') {
					script += 'cd \ ' + sourcePath;
					script += newline;
				}
			}

			// add custom shell command
			//
			var customShellCommand = packageVersion.get('custom_shell_cmd');
			if (customShellCommand && customShellCommand != '') {

				// add highlighting
				//
				if (this.options.highlight == 'build-command') {
					customShellCommand = this.getHighlighted(customShellCommand);
				}

				script += customShellCommand;
				script += newline;	
			}

			// add android redo build command
			//
			if (packageVersion.get('android_redo_build')) {
				var redoBuildCommand = 'rm -f build.xml';

				// add highlighting
				//
				if (this.options.highlight == 'android-redo-build') {
					redoBuildCommand = this.getHighlighted(redoBuildCommand);
				}

				script += redoBuildCommand;
				script += newline;
			}

			// add android update command
			//
			var packageType = this.options.package.getPackageType();
			if (packageType == 'android-source') {
				script += 'android update project -p . -s';
				if (this.model.get('android_sdk_target')) {
					var androidSDKTarget = this.model.get('android_sdk_target');
					if (this.options.highlight == 'android-sdk-target') {
						androidSDKTarget = this.getHighlighted(androidSDKTarget);
					}			
					script += ' -t ' + "'" + androidSDKTarget + "'";
				}
				script += newline;
			}

			// add configure command
			//
			var configureCommand = this.getConfigureCommand(packageVersion);
			if (configureCommand && configureCommand != '') {
				script += configureCommand;
				script += newline;	
			}

			// add build command
			//
			var buildCommand = this.getBuildCommand(packageVersion);
			if (buildCommand && buildCommand != '') {
				script += buildCommand;
				script += newline;
			}

			return script;
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				buildScript: this.getBuildScript(this.model)
			}));
		}
	});
});
