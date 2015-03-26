<?php

namespace Filters;

use Illuminate\Support\Facades\Input;
use Models\Platforms\Platform;
use Models\Platforms\PlatformVersion;

class PlatformFilter2 {
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
			$platformVersions = PlatformVersion::where('platform_uuid', '=', $platformUuid)->get();
			$query = $query->where(function($query) use ($platformVersions) {
				for ($i = 0; $i < sizeof($platformVersions); $i++) {
					if ($i == 0) {
						$query->where('platform_version_uuid', '=', $platformVersions[$i]->platform_version_uuid);
					} else {
						$query->orWhere('platform_version_uuid', '=', $platformVersions[$i]->platform_version_uuid);
					}
				}
			});
		}

		// check for platform version
		//
		$platformVersion = Input::get('platform_version');
		if ($platformVersion == 'latest') {
			$platform = Platform::where('platform_uuid', '=', $platformUuid)->first();
			if ($platform) {
				$latestVersion = $platform->getLatestVersion();
				$query = $query->where('platform_version_uuid', '=', $latestVersion->platform_version_uuid);
			}
		} else if ($platformVersion != '') {
			$query = $query->where('platform_version_uuid', '=', $platformVersion);
		}

		// check for platform version uuid
		//
		$platformVersionUuid = Input::get('platform_version_uuid');
		if ($platformVersionUuid == 'latest') {
			$platform = Platform::where('platform_uuid', '=', $platformUuid)->first();
			if ($platform) {
				$latestVersion = $platform->getLatestVersion();
				$query = $query->where('platform_version_uuid', '=', $latestVersion->platform_version_uuid);
			}
		} else if ($platformVersionUuid != '') {
			$query = $query->where('platform_version_uuid', '=', $platformVersionUuid);
		}

		return $query;
	}
}
