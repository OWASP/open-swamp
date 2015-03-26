<?php

namespace Models\Packages;

use Illuminate\Support\Facades\Response;
use Models\Packages\PackageVersion;
use Models\Utilities\Archive;

class PythonPackageVersion extends PackageVersion {

	//
	// querying methods
	//

	function getBuildSystem() {
	
		// create archive from package
		//
		$archive = new Archive($this->getPackagePath());
		$buildPath = Archive::concatPaths($this->source_path, $this->build_dir);

		// check for ant
		//
		if ($archive->found($buildPath, 'setup.py')) {
			return Response::make("distutils", 200);

		// default case
		//
		} else {
			return Response::make("Could not determine build system.", 404);
		}

	}

	function checkBuildSystem() {
		switch ($this->build_system) {

			case 'none':
				return Response::make("Python package ok for no build.", 200);
				break;

			case 'distutils':

				// create archive from package
				//
				$archive = new Archive($this->getPackagePath());
				$buildPath = Archive::concatPaths($this->source_path, $this->build_dir);
				$buildFile = $this->build_file;

				// search archive for build file in build path
				//
				if ($buildFile != NULL) {
					if ($archive->contains($buildPath, $buildFile)) {
						return Response::make("Python package build system ok for build with distutils.", 200);
					} else {
						return Response::make("Could not find a build file called '".$buildFile."' within the '".$buildPath."' directory. You may need to set your build path or the path to your build file.", 404);
					}
				}
				break;

			case 'other':
				return Response::make("Python package ok for no build.", 200);
				break;
		}
	}
}
