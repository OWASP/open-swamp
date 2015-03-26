<?php

namespace Filters;

use Illuminate\Support\Facades\Input;

class DateFilter {
	static function after($query) {
		$after = Input::get('after');
		if ($after != '') {
			$afterDate = new \DateTime($after);
			$query = $query->where('create_date', '>=', $afterDate);
		}
		return $query;
	}

	static function before($query) {
		$before = Input::get('before');
		if ($before != '') {
			$beforeDate = new \DateTime($before);
			$query = $query->where('create_date', '<=', $beforeDate);
		}
		return $query;
	}

	static function apply($query) {
		$query = DateFilter::after($query);
		$query = DateFilter::before($query);
		return $query;
	}
}
