<?php

namespace Models\Packages;

use Illuminate\Support\Facades\Response;
use Models\Packages\PackageVersion;
use Models\Utilities\Archive;

class JavaBytecodePackageVersion extends PackageVersion {

	//
	// querying methods
	//

	function getBuildSystem() {
		return Response::make("none", 200);
	}

	function checkBuildSystem() {
		return Response::make("Build system ok.", 200);
	}
}
