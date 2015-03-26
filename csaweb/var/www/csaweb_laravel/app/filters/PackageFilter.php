<?php

namespace Filters;

use Illuminate\Support\Facades\Input;
use Models\Packages\Package;
use Models\Packages\PackageVersion;

class PackageFilter {
	static function apply($query, $projectUuid) {

		// check for package name
		//
		$packageName = Input::get('package_name');
		if ($packageName != '') {
			$query = $query->where('package_name', '=', $packageName);
		}

		// check for package uuid
		//
		$packageUuid = Input::get('package_uuid');
		if ($packageUuid != '') {
			$query = $query->where('package_uuid', '=', $packageUuid);
		}

		// check for package version
		//
		$packageVersion = Input::get('package_version');
		if ($packageVersion == 'latest') {
			$query = $query->whereNull('package_version_uuid');
		} else if ($packageVersion != '') {
			$query = $query->where('package_version_uuid', '=', $packageVersion);
		}

		// check for package version uuid
		//
		$packageVersionUuid = Input::get('package_version_uuid');
		if ($packageVersionUuid == 'latest') {
			$query = $query->whereNull('package_version_uuid');
		} else if ($packageVersionUuid != '') {
			$query = $query->where('package_version_uuid', '=', $packageVersionUuid);
		}

		return $query;
	}
}
