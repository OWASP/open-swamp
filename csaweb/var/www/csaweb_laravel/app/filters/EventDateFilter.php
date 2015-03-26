<?php

namespace Filters;

use Illuminate\Support\Facades\Input;

class EventDateFilter {

	// check for after date
	//
	static function after($query) {
		$after = Input::get('after');
		if ($after != '') {
			$afterDate = new \DateTime($after);
			$afterDate->setTime(0, 0);
			$query = $query->where('event_date', '>=', $afterDate);
		}
		return $query;
	}

	// check for before date
	//
	static function before($query) {
		$before = Input::get('before');
		if ($before != '') {
			$beforeDate = new \DateTime($before);
			$beforeDate->setTime(24, 0);
			$query = $query->where('event_date', '<=', $beforeDate);
		}
		return $query;
	}

	// check for before and after date
	//
	static function apply($query) {
		$query = DateFilter::after($query);
		$query = DateFilter::before($query);
		return $query;
	}
}
