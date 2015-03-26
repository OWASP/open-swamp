<?php

namespace Filters;

use Illuminate\Support\Facades\Input;
use Models\Tools\Tool;
use Models\Tools\ToolVersion;

class ToolFilter {
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
			$query = $query->where('tool_uuid', '=', $toolUuid);
		}

		// check for tool version
		//
		$toolVersion = Input::get('tool_version');
		if ($toolVersion == 'latest') {
			$query = $query->whereNull('tool_version_uuid');
		} else if ($toolVersion != '') {
			$query = $query->where('tool_version_uuid', '=', $toolVersion);
		}

		// check for tool version uuid
		//
		$toolVersionUuid = Input::get('tool_version_uuid');
		if ($toolVersionUuid == 'latest') {
			$tool = Tool::where('tool_uuid', '=', $toolVersionUuid)->first();
			$query = $query->whereNull('tool_version_uuid');
		} else if ($toolVersionUuid != '') {
			$query = $query->where('tool_version_uuid', '=', $toolVersionUuid);
		}
		
		return $query;
	}
}
