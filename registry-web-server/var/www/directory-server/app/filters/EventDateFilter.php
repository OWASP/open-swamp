<?php

namespace Filters;

use Illuminate\Support\Facades\Input;

class EventDateFilter {
	static function after($query) {
		$after = Input::get('after');
		if ($after != '') {
			$afterDate = new \DateTime($after);
			$query = $query->where('event_date', '>=', $afterDate);
		}
		return $query;
	}

	static function before($query) {
		$before = Input::get('before');
		if ($before != '') {
			$beforeDate = new \DateTime($before);
			$query = $query->where('event_date', '<=', $beforeDate);
		}
		return $query;
	}

	static function apply($query) {
		$query = self::after($query);
		$query = self::before($query);
		return $query;
	}
}
