<?php

namespace Controllers\Events;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Models\Events\PersonalEvent;
use Controllers\BaseController;
use Controllers\Events\ProjectEventsController;
use Filters\EventDateFilter;

class PersonalEventsController extends BaseController {

	// get by user id
	//
	public static function getByUser($userUid) {
		$personalEventsQuery = PersonalEvent::where('user_uid', '=', $userUid);

		// add filters
		//
		$personalEventsQuery = EventDateFilter::apply($personalEventsQuery);

		return $personalEventsQuery->get();
	}

	// get number by user id
	//
	public static function getNumByUser($userUid) {
		$personalEventsQuery = PersonalEvent::where('user_uid', '=', $userUid);

		// add filters
		//
		$personalEventsQuery = EventDateFilter::apply($personalEventsQuery);

		return $personalEventsQuery->count();
	}

	// get number of all events by user id
	//
	public static function getNumAllByUser($userUid) {

		// get number of user events
		//
		$num = self::getNumByUser($userUid);

		// add number of project events by user
		//
		$num += ProjectEventsController::getNumByUser($userUid);

		// add number of user project events by user
		//
		$num += ProjectEventsController::getNumUserProjectEvents($userUid);

		return $num;
	}
}