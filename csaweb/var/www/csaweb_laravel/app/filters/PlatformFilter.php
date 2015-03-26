<?php

namespace Filters;

use Illuminate\Support\Facades\Input;
use Models\Platforms\Platform;
use Models\Platforms\PlatformVersion;

class PlatformFilter {
	static function apply($query) {

		// check for platform name
		//
		$platformName = Input::get('platform_name');
		if ($platformName != '') {
			$query = $query->where('platform_name', '=', $platformName);
		}

		// check for platform uuid
		//
		$platformUuid = Input::get('platform_uuid');
		if ($platformUuid != '') {
			$query = $query->where('platform_uuid', '=', $platformUuid);
		}

		// check for platform version
		//
		$platformVersion = Input::get('platform_version');
		if ($platformVersion == 'latest') {
			$query = $query->whereNull('platform_version_uuid');
		} else if ($platformVersion != '') {
			$query = $query->where('platform_version_uuid', '=', $platformVersion);
		}

		// check for platform version uuid
		//
		$platformVersionUuid = Input::get('platform_version_uuid');
		if ($platformVersionUuid == 'latest') {
			$query = $query->whereNull('platform_version_uuid');
		} else if ($platformVersionUuid != '') {
			$query = $query->where('platform_version_uuid', '=', $platformVersionUuid);
		}

		return $query;
	}
}
