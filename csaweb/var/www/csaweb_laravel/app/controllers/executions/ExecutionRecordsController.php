<?php

namespace Controllers\Executions;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Config;
use Models\Projects\Project;
use Models\Executions\ExecutionRecord;
use Models\Packages\PackageVersion;
use Models\Tools\ToolVersion;
use Models\Platforms\PlatformVersion;
use Models\Users\User;
use Models\Users\UserPermission;
use Controllers\BaseController;
use Filters\DateFilter;
use Filters\TripletFilter2;
use Filters\LimitFilter;

class ExecutionRecordsController extends BaseController {

	// get by index
	//
	public function getIndex($executionRecordUuid) {
		return ExecutionRecord::where('execution_record_uuid', '=', $executionRecordUuid)->first();
	}

	// get ssh access
	//
	public function getSshAccess($executionRecordUuid){
 		$permission = UserPermission::where('user_uid','=',Session::get('user_uid'))->where('permission_code','=','ssh-access')->first();
		if( ! $permission ) return Response::make('You do not have permission to access SSH information.', 401);
		$record = ExecutionRecord::where('execution_record_uuid','=',$executionRecordUuid)->first();

		$attempts = 30;

		// look up ip
		//
		do {
			if( $attempts < 30 ) 
				sleep( 1 );
			$dns 	= Config::get('app.nameserver');  
			$host 	= $record->vm_hostname;
			$ip 	= `nslookup $host $dns`; 
			$vm_ip 	= array();
			if(preg_match_all('/Address: ((?:\d{1,3}\.){3}\d{1,3})/', $ip, $match) > 0)
				$vm_ip = $match[1][0];
			$attempts--;
		} while( ! $vm_ip && $attempts > 0 );

		if( ! $vm_ip ) return Response::make('Request timed out.',500);

		// floodlight rules
		//
		$address = Config::get('app.floodlight') . '/wm/core/controller/switches/json';
		$result = `curl -X GET $address`;
		$switches = json_decode( $result );
		$results = array();		
		$id = 1;
		foreach( $switches as $switch ){
			$results[] = $switch->dpid;
			$address = Config::get('app.floodlight') . '/wm/staticflowentrypusher/json';
			$data = json_encode(array(
				'switch'		=> $switch->dpid,
				'name'			=> $record->vm_hostname . '-' . $_SERVER['REMOTE_ADDR'] . "-$id",
				'priority'		=> '65',
				'src-ip'		=> $_SERVER['REMOTE_ADDR'] . '/32',
				'dst-ip'		=> $vm_ip . '/32',
				'ether-type'	=> '2048',
				'active'		=> 'true',
				'actions'		=> 'output=flood'
			));
			$results[] = `curl -X POST -d '$data' $address`;
			$id++;
			$data = json_encode(array(
				'switch'		=> $switch->dpid,
				'name'			=> $record->vm_hostname . '-' . $_SERVER['REMOTE_ADDR'] . "-$id",
				'priority'		=> '65',
				'src-ip'		=> $vm_ip . '/32',
				'dst-ip'		=> $_SERVER['REMOTE_ADDR'] . '/32',
				'ether-type'	=> '2048',
				'active'		=> 'true',
				'actions'		=> 'output=flood'
			));
			$results[] = `curl -X POST -d '$data' $address`;
			$id++;
		}

		// make floodlight request
		//
		return array(
			'src_ip'		=> $_SERVER['REMOTE_ADDR'],
			'vm_hostname'	=> $record->vm_hostname,
			'vm_ip'			=> $vm_ip,
			'vm_username'	=> $record->vm_username,
			'vm_password'	=> $record->vm_password
		);
	}

	// get by project
	//
	public function getByProject($projectUuid) {
		if (!strpos($projectUuid, '+')) {

			// check for inactive or non-existant project
			//
			$project = Project::where('project_uid', '=', $projectUuid)->first();
			if (!$project || !$project->isActive()) {
				return array();
			}

			// get by a single project
			//
			$executionRecordsQuery = ExecutionRecord::where('project_uuid', '=', $projectUuid);
		
			// add filters
			//
			$executionRecordsQuery = DateFilter::apply($executionRecordsQuery);
			$executionRecordsQuery = TripletFilter2::apply($executionRecordsQuery, $projectUuid);
		} else {

			// get by multiple projects
			//
			$projectUuids = explode('+', $projectUuid);
			foreach ($projectUuids as $projectUuid) {

				// check for inactive or non-existant project
				//
				$project = Project::where('project_uid', '=', $projectUuid)->first();
				if (!$project || !$project->isActive()) {
					continue;
				}

				if (!isset($executionRecordsQuery)) {
					$executionRecordsQuery = ExecutionRecord::where('project_uuid', '=', $projectUuid);
				} else {
					$executionRecordsQuery = $executionRecordsQuery->orWhere('project_uuid', '=', $projectUuid);
				}
			
				// add filters
				//
				$executionRecordsQuery = DateFilter::apply($executionRecordsQuery);
				$executionRecordsQuery = TripletFilter2::apply($executionRecordsQuery, $projectUuid);
			}
		}

		// order results before applying filter
		//
		$executionRecordsQuery = $executionRecordsQuery->orderBy('create_date', 'DESC');

		// add limit filter
		//
		$executionRecordsQuery = LimitFilter::apply($executionRecordsQuery);

		// allow soft delete
		//
		$executionRecordsQuery = $executionRecordsQuery->whereNull('delete_date');

		// execute query
		//
		return $executionRecordsQuery->get();
	}

	// get number by project
	//
	public function getNumByProject($projectUuid) {
		if (!strpos($projectUuid, '+')) {

			// get by a single project
			//
			$executionRecordsQuery = ExecutionRecord::where('project_uuid', '=', $projectUuid);
		
			// add filters
			//
			$executionRecordsQuery = DateFilter::apply($executionRecordsQuery);
			$executionRecordsQuery = TripletFilter2::apply($executionRecordsQuery, $projectUuid);
		} else {

			// get by multiple projects
			//
			$projectUuids = explode('+', $projectUuid);
			$executionRecordsQuery = ExecutionRecord::where('project_uuid', '=', $projectUuids[0]);
			
			// add filters
			//
			$executionRecordsQuery = DateFilter::apply($executionRecordsQuery);
			$executionRecordsQuery = TripletFilter2::apply($executionRecordsQuery, $projectUuid);

			// add queries for each successive project in list
			//
			for ($i = 1; $i < sizeof($projectUuids); $i++) {
				$executionRecordsQuery = $executionRecordsQuery->orWhere('project_uuid', '=', $projectUuids[$i]);
			
				// add filters
				//
				$executionRecordsQuery = DateFilter::apply($executionRecordsQuery);
				$executionRecordsQuery = TripletFilter2::apply($executionRecordsQuery, $projectUuid);
			}
		}

		// allow soft delete
		//
		$executionRecordsQuery = $executionRecordsQuery->whereNull('delete_date');

		// execute query
		//
		return $executionRecordsQuery->count();
	}

	// get all
	//
	public function getAll() {
		$user = User::getIndex(Session::get('user_uid'));
		if ($user && $user->isAdmin()) {
			$executionRecordsQuery = ExecutionRecord::orderBy('create_date', 'DESC');

			// add filters
			//
			$executionRecordsQuery = DateFilter::apply($executionRecordsQuery);
			$executionRecordsQuery = TripletFilter2::apply($executionRecordsQuery, null);
			$executionRecordsQuery = LimitFilter::apply($executionRecordsQuery);

			// allow soft delete
			//
			$executionRecordsQuery = $executionRecordsQuery->whereNull('delete_date');
			
			return $executionRecordsQuery->get();
		}
	}

	// delete by index
	//
	public function deleteIndex($executionRecordUuid) {
		$executionRecord = ExecutionRecord::where('execution_record_uuid', '=', $executionRecordUuid)->first();
		$executionRecord->delete();
		return $executionRecord;
	}
}
