<?php

namespace Filters;

use Illuminate\Support\Facades\Input;
use Models\Packages\PackageType;

class PackageTypeFilter {
	static function apply($query) {

		// check for package type
		//
		$type = Input::get('type');
		if ($type != '') {
			$packageType = PackageType::where('name', '=', $type)->first();
			if ($packageType) {
				$query = $query->where('package_type_id', '=', $packageType->package_type_id); 
			}
		}

		return $query;
	}
}
