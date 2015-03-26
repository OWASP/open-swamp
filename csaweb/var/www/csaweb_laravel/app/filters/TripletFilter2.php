<?php

namespace Filters;

use Illuminate\Support\Facades\Input;
use Filters\PackageFilter2;
use Filters\ToolFilter2;
use Filters\PlatformFilter2;

class TripletFilter2 {
	static function apply($query, $projectUuid) {
		$query = PackageFilter2::apply($query, $projectUuid);
		$query = ToolFilter2::apply($query);
		$query = PlatformFilter2::apply($query);
		return $query;
	}
}
