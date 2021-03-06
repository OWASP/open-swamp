<?php

namespace Filters;

use Illuminate\Support\Facades\Input;
use Models\Tools\Tool;
use Models\Tools\ToolVersion;

class ToolFilter2 {
	static function apply($query) {

		// check for tool name
		//
		$toolName = Input::get('tool_name');
		if ($toolName != '') {
			$query = $query->where('tool_name', '=', $toolName);
		}

		// check for tool uuid
		//
		$toolUuid = Input::get('tool_uuid');
		if ($toolUuid != '') {
			$toolVersions = ToolVersion::where('tool_uuid', '=', $toolUuid)->get();
			$query = $query->where(function($query) use ($toolVersions) {
				for ($i = 0; $i < sizeof($toolVersions); $i++) {
					if ($i == 0) {
						$query->where('tool_version_uuid', '=', $toolVersions[$i]->tool_version_uuid);
					} else {
						$query->orWhere('tool_version_uuid', '=', $toolVersions[$i]->tool_version_uuid);
					}
				}
			});
		}

		// check for tool version
		//
		$toolVersion = Input::get('tool_version');
		if ($toolVersion == 'latest') {
			$tool = $tool::where('tool_uuid', '=', $toolUuid)->first();
			if ($tool) {
				$latestVersion = $tool->getLatestVersion();
				$query = $query->where('tool_version_uuid', '=', $latestVersion->tool_version_uuid);
			}
		} else if ($toolVersion != '') {
			$query = $query->where('tool_version_uuid', '=', $toolVersion);
		}

		// check for tool version uuid
		//
		$toolVersionUuid = Input::get('tool_version_uuid');
		if ($toolVersionUuid == 'latest') {
			$tool = Tool::where('tool_uuid', '=', $toolVersionUuid)->first();
			if ($tool) {
				$latestVersion = $tool->getLatestVersion();
				$query = $query->where('tool_version_uuid', '=', $latestVersion->tool_version_uuid);
			}
		} else if ($toolVersionUuid != '') {
			$query = $query->where('tool_version_uuid', '=', $toolVersionUuid);
		}
		
		return $query;
	}
}
