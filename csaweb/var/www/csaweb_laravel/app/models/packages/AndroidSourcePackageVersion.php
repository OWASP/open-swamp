<?php

namespace Models\Packages;

use Illuminate\Support\Facades\Response;
use Models\Packages\JavaSourcePackageVersion;
use Models\Utilities\Archive;

class AndroidSourcePackageVersion extends JavaSourcePackageVersion {

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
		if ($archive->found($buildPath, 'build.xml')) {
			return Response::make("android+ant", 200);

		// default case
		//
		} else {
			return Response::make("Could not determine build system.", 404);
		}
	}

	function checkBuildSystem() {
		switch ($this->build_system) {

			case 'android+ant':

				// create archive from package
				//
				$archive = new Archive($this->getPackagePath());

				// find build path and file
				//
				$buildPath = Archive::concatPaths($this->source_path, $this->build_dir);
				$buildFile = $this->build_file;
				if ($buildFile == NULL) {
					$buildFile = 'build.xml';
				}

				// search archive for build file in build path
				//
				if ($archive->contains($buildPath, $buildFile)) {
					return Response::make("Java source package version is ok for ant.", 200);
				} else {
					return Response::make("Could not find a build file called '".$buildFile."' within the '".$buildPath."' directory. You may need to set your build path or the path to your build file.", 404);
				}
				break;
		}
	}
}
