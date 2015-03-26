<?php

namespace Controllers\Events;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Models\Users\User;
use Models\Projects\Project;
use Controllers\BaseController;
use Filters\EventDateFilter;
use Filters\LimitFilter;

class ProjectEventsController extends BaseController {

	// get by user id
	//
	public static function getByUser($userUid) {
		$projectEvents = new Collection;

		// get optional project paramter
		//
		$projectUid = Input::get('project_uuid');

		if ($projectUid != '') {
			$project = Project::where('project_uid', '=', $projectUid)->first();

			// get events for a specific project
			//
			$projectEventsQuery = $project->getEventsQuery();

			// add filters
			//
			$projectEventsQuery = EventDateFilter::apply($projectEventsQuery);
			$projectEventsQuery = LimitFilter::apply($projectEventsQuery);

			$projectEvents = $projectEventsQuery->get();
		} else {
			$projectEvents = new Collection;

			// collect events of user's projects
			//
			$user = User::getIndex($userUid);
			if ($user) {
				$projects = $user->getProjects();
				for ($i = 0; $i < sizeOf($projects); $i++) {
					if ($projects[$i] != null) {
						$projectEventsQuery = $projects[$i]->getEventsQuery();

						// apply filters
						//
						$projectEventsQuery = EventDateFilter::apply($projectEventsQuery);
						$projectEventsQuery = LimitFilter::apply($projectEventsQuery);

						$events = $projectEventsQuery->get();
						if ($events) {
							$projectEvents = $projectEvents->merge($events);
						}
					}
				}
			}
		}

		return $projectEvents;
	}

	// get number by user id
	//
	public static function getNumByUser($userUid) {
		$num = 0;

		// get optional project paramter
		//
		$projectUid = Input::get('project_uuid');

		if ($projectUid != '') {
			$project = Project::where('project_uid', '=', $projectUid)->first();

			// get events for a specific project
			//
			$projectEventsQuery = $project->getEventsQuery();

			// add filters
			//
			$projectEventsQuery = EventDateFilter::apply($projectEventsQuery);
			$projectEventsQuery = LimitFilter::apply($projectEventsQuery);

			$num = $projectEventsQuery->count();
		} else {
			$projectEvents = new Collection;

			// collect events of user's projects
			//
			$user = User::getIndex($userUid);
			if ($user) {
				$projects = $user->getProjects();
				for ($i = 0; $i < sizeOf($projects); $i++) {
					if ($projects[$i] != null) {
						$projectEventsQuery = $projects[$i]->getEventsQuery();

						// apply filters
						//
						$projectEventsQuery = EventDateFilter::apply($projectEventsQuery);
						$projectEventsQuery = LimitFilter::apply($projectEventsQuery);

						$num += $projectEventsQuery->count();
					}
				}
			}
		}

		return $num;
	}

	// get user project events by id
	//
	public static function getUserProjectEvents($userUid) {
		$userProjectEvents = new Collection;

		// get optional project paramter
		//
		$projectUid = Input::get('project_uuid');

		if ($projectUid != '') {
			$project = Project::where('project_uid', '=', $projectUid)->first();

			// get events for a specific project
			//
			$userProjectEventsQuery = $project->getUserEventsQuery();

			// apply filters
			//
			$userProjectEventsQuery = EventDateFilter::apply($userProjectEventsQuery);
			$userProjectEventsQuery = LimitFilter::apply($userProjectEventsQuery);

			$userProjectEvents = $userProjectEventsQuery->get();
		} else {
			$userProjectEvents = new Collection;

			// collect events of user's projects
			//
			$user = User::getIndex($userUid);
			if ($user) {
				$projects = $user->getProjects();
				for ($i = 0; $i < sizeOf($projects); $i++) {
					if ($projects[$i] != null) {
						$userProjectEventsQuery = $projects[$i]->getUserEventsQuery();

						// apply filters
						//
						$userProjectEventsQuery = EventDateFilter::apply($userProjectEventsQuery);
						$userProjectEventsQuery = LimitFilter::apply($userProjectEventsQuery);

						$events = $userProjectEventsQuery->get();				
						if ($events) {
							$userProjectEvents = $userProjectEvents->merge($events);
						}
					}
				}
			}
		}

		return $userProjectEvents;
	}

	// get number of user project events by id
	//
	public static function getNumUserProjectEvents($userUid) {
		$num = 0;

		// get optional project paramter
		//
		$projectUid = Input::get('project_uuid');

		if ($projectUid != '') {
			$project = Project::where('project_uid', '=', $projectUid)->first();

			// get events for a specific project
			//
			$userProjectEventsQuery = $project->getUserEventsQuery();

			// apply filters
			//
			$userProjectEventsQuery = EventDateFilter::apply($userProjectEventsQuery);
			$userProjectEventsQuery = LimitFilter::apply($userProjectEventsQuery);

			$num = $userProjectEventsQuery->count();
		} else {
			$userProjectEvents = new Collection;

			// collect events of user's projects
			//
			$user = User::getIndex($userUid);
			if ($user) {
				$projects = $user->getProjects();
				for ($i = 0; $i < sizeOf($projects); $i++) {
					if ($projects[$i] != null) {
						$userProjectEventsQuery = $projects[$i]->getUserEventsQuery();

						// apply filters
						//
						$userProjectEventsQuery = EventDateFilter::apply($userProjectEventsQuery);
						$userProjectEventsQuery = LimitFilter::apply($userProjectEventsQuery);

						$num += $userProjectEventsQuery->count();
					}
				}
			}
		}

		return $num;
	}
}