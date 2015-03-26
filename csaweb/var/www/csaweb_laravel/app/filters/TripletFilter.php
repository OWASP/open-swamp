<?php

namespace Filters;

use Illuminate\Support\Facades\Input;
use Filters\PackageFilter;
use Filters\ToolFilter;
use Filters\PlatformFilter;

class TripletFilter {
	static function apply($query, $projectUuid) {
		$query = PackageFilter::apply($query, $projectUuid);
		$query = ToolFilter::apply($query);
		$query = PlatformFilter::apply($query);
		return $query;
	}
}
