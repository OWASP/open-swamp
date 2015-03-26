<?php

namespace Models\Packages;

use Illuminate\Support\Facades\Response;
use Models\Packages\PackageVersion;
use Models\Utilities\Archive;

class CPackageVersion extends PackageVersion {

	//
	// querying methods
	//

	function getBuildSystem() {
		
		// create archive from package
		//
		$archive = new Archive($this->getPackagePath());

		// check for configure
		//
		$configPath = Archive::concatPaths($this->source_path, $this->config_dir);
		if ($archive->found($configPath, 'configure')) {

			// configure + make
			//
			return Response::make("configure+make", 200);
		} else {

			// make
			//
			$buildPath = Archive::concatPaths($this->source_path, $this->build_dir);
			if ($archive->found($buildPath, 'makefile') || 
				$archive->found($buildPath, 'Makefile')) {
				return Response::make("make", 200);
			} else {
				return Response::make("Could not determine build system.", 404);
			}
		}
	}

	function checkBuildSystem() {
		switch ($this->build_system) {

			case 'make':

				// create archive from package
				//
				$archive = new Archive($this->getPackagePath());
				$buildPath = Archive::concatPaths($this->source_path, $this->build_dir);
				$buildFile = $this->build_file;

				// search archive for build file in build path
				//
				if ($buildFile != NULL) {
					if ($archive->contains($buildPath, $buildFile)) {
						return Response::make("C/C++ package build system ok for make.", 200);
					} else {
						return Response::make("Could not find a build file called '".$buildFile."' within the '".$buildPath."' directory.  You may need to set your build path or the path to your build file.", 404);
					}
				}

				// search archive for default build file in build path
				//
				if ($archive->contains($buildPath, 'makefile') || 
					$archive->contains($buildPath, 'Makefile')) {
					return Response::make("C/C++ package build system ok for make.", 200);
				} else {
					return Response::make("Could not find a build file called 'makefile' or 'Makefile' within '".$this->source_path."' directory. You may need to set your build path or the path to your build file.", 404);
				}
				break;

			case 'configure+make':

				// create archive from package
				//
				$archive = new Archive($this->getPackagePath());

				// find config file and path
				//
				$configPath = Archive::concatPaths($this->source_path, $this->config_dir);
				$configFile = str_replace("./", "", $this->config_cmd);

				// search archive for config file in config path
				//
				if ($archive->contains($configPath, $configFile)) {
					return Response::make("C/C++ package build system ok for configure+make.", 200);
				} else {
					return Response::make("Could not find a configuration file called '".$configFile."' within directory '".$configPath."'.", 404);
				}
				break;

			case 'cmake+make':
				return Response::make("C/C++ package build system ok for cmake+make.", 200);
				break;
		}
	}
}
