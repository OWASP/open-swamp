<?php

namespace Filters;

use Illuminate\Support\Facades\Input;

class LimitFilter {
	static function apply($query) {
		$limit = Input::get('limit');
		if ($limit != '') {
			$query = $query->take($limit);
		}
		return $query;
	}
}
