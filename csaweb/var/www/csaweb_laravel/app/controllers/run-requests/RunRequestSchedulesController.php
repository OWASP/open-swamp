<?php

namespace Controllers\RunRequests;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Models\RunRequests\RunRequestSchedule;
use Models\Utilities\GUID;
use Controllers\BaseController;

class RunRequestSchedulesController extends BaseController {

	// create
	//
	public function postCreate() {

		if (Input::has('run_request_uuid')) {

			// create a single model
			//
			$runRequestSchedule = new RunRequestSchedule(array(
				'run_request_schedule_uuid' => GUID::create(),
				'run_request_uuid' => Input::get('run_request_uuid'),
				'recurrence_type' => Input::get('recurrence_type')
			));

			// set optional attributes
			//
			if (array_key_exists('recurrence_day', $input)) {
				$runRequestSchedule->recurrence_day = $input['recurrence_day'];
			}
			if (array_key_exists('time_of_day', $input)) {
				$runRequestSchedule->time_of_day = $input['time_of_day'];
			}

			$runRequestSchedule->save();
			return $runRequestSchedule;
		} else {

			// create an array of models
			//
			$inputs = Input::all();
			$runRequestSchedules = new Collection;
			for ($i = 0; $i < sizeOf($inputs); $i++) {
				$input = $inputs[$i];
				$runRequestSchedule = new RunRequestSchedule(array(
					'run_request_schedule_uuid' => GUID::create(),
					'run_request_uuid' => $input['run_request_uuid'],
					'recurrence_type' => $input['recurrence_type']
				));

				// set optional attributes
				//
				if (array_key_exists('recurrence_day', $input)) {
					$runRequestSchedule->recurrence_day = $input['recurrence_day'];
				}
				if (array_key_exists('time_of_day', $input)) {
					$runRequestSchedule->time_of_day = $input['time_of_day'];
				}

				$runRequestSchedules->push($runRequestSchedule);
				$runRequestSchedule->save();
			}
			return $runRequestSchedules;
		}
	}
	
	// get by index
	//
	public function getIndex($runRequestScheduleUuid) {
		$runRequest = RunRequestSchedule::where('run_request_schedule_uuid', '=', $runRequestScheduleUuid)->first();
		return $runRequest;
	}

	// get by run request
	//
	public function getByRunRequest($runRequestUuid) {
		$runRequestSchedules = RunRequestSchedule::where('run_request_uuid', '=', $runRequestUuid)->get();
		return $runRequestSchedules;
	}

	// update by index
	//
	public function updateIndex($runRequestScheduleUuid) {
		$runRequestSchedule = $this->getIndex($runRequestScheduleUuid);
		$runRequestSchedule->run_request_uuid = Input::get('run_request_uuid');

		// set optional attributes
		//
		if (array_key_exists('recurrence_day', $input)) {
			$runRequestSchedule->recurrence_day = $input['recurrence_day'];
		}
		if (array_key_exists('time_of_day', $input)) {
			$runRequestSchedule->time_of_day = $input['time_of_day'];
		}

		$runRequestSchedule->save();
		return $runRequestSchedule;
	}

	// update multiple
	//
	public function updateMultiple() {
		$inputs = Input::all();
		$collection = new Collection;
		for ($i = 0; $i < sizeOf($inputs); $i++) {

			// get input item
			//
			$input = $inputs[$i];
			if (array_key_exists('run_request_schedule_uuid', $input)) {
				
				// find existing model
				//
				$runRequestSchedule = RunRequestSchedule::where('run_request_schedule_uuid', '=', $input['run_request_schedule_uuid'])->first();
				$collection->push($runRequestSchedule);
			} else {
				
				// create new model
				//
				$runRequestSchedule = new RunRequestSchedule(array(
					'run_request_schedule_uuid' => GUID::create()
				));
			}
			
			// update model
			//
			$runRequestSchedule->run_request_uuid = $input['run_request_uuid'];
			$runRequestSchedule->recurrence_type = $input['recurrence_type'];

			// set optional attributes
			//
			if (array_key_exists('recurrence_day', $input)) {
				$runRequestSchedule->recurrence_day = $input['recurrence_day'];
			}
			if (array_key_exists('time_of_day', $input)) {
				$runRequestSchedule->time_of_day = $input['time_of_day'];
			}
			
			// save model
			//
			$runRequestSchedule->save();
		}
		return $collection;
	}

	// delete by index
	//
	public function deleteIndex($runRequestScheduleUuid) {
		$runRequestSchedule = RunRequestSchedule::where('run_request_schedule_uuid', '=', $runRequestScheduleUuid)->first();
		$runRequestSchedule->delete();
		return $runRequestSchedule;
	}
}