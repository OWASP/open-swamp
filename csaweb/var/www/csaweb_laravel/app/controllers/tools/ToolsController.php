<?php

namespace Controllers\Tools;

use PDO;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Models\Users\User;
use Models\Tools\Tool;
use Models\Packages\Package;
use Models\Projects\Project;
use Models\Projects\ProjectMembership;
use Models\Tools\ToolVersion;
use Models\Tools\ToolSharing;
use Models\Utilities\GUID;
use Controllers\BaseController;
use Filters\DateFilter;
use Filters\LimitFilter;

class ToolsController extends BaseController {

	// create
	//
	public function postCreate() {
		$tool = new Tool(array(
			'tool_uuid' => GUID::create(),
			'name' => Input::get('name'),
			'tool_owner_uuid' => Input::get('tool_owner_uuid'),
			'is_build_needed' => Input::get('is_build_needed'),
			'tool_sharing_status' => Input::get('tool_sharing_status')
		));
		$tool->save();
		return $tool;
	}

	// get all for admin user
	//
	public function getAll(){
		$user = User::getIndex(Session::get('user_uid'));
		if ($user && $user->isAdmin()){
			$toolsQuery = Tool::orderBy('create_date', 'DESC');

			// add filters
			//
			$toolsQuery = DateFilter::apply($toolsQuery);
			$toolsQuery = LimitFilter::apply($toolsQuery);

			return $toolsQuery->get();
		}
		return '';
	}

	// get by index
	//
	public function getIndex($toolUuid) {
		$tool = Tool::where('tool_uuid', '=', $toolUuid)->first();
		return $tool;
	}

	// get by user
	//
	public function getByUser($userUuid) {

		// create stored procedure call
		//
		$connection = DB::connection('tool_shed');
		$pdo = $connection->getPdo();

		$stmt = $pdo->prepare("CALL list_tools_by_owner(:userUuidIn, @returnString)");
		$stmt->bindParam(':userUuidIn', $userUuid, PDO::PARAM_STR, 45);
		$stmt->execute();
		$results = array();

		do {
			foreach( $stmt->fetchAll( PDO::FETCH_ASSOC ) as $row )
				$results[] = $row;
		} while ( $stmt->nextRowset() );

		$select = $pdo->query('SELECT @returnString');
		$returnString = $select->fetchAll( PDO::FETCH_ASSOC )[0]['@returnString'];
		$select->nextRowset();

		if( $returnString == 'SUCCESS' )
			return $results;
		else
			return Response::make( $returnString, 500 );
	}

	// get by public scoping
	//
	public function getPublic() {
		$tools = Tool::where('tool_sharing_status', '=', 'public')->orderBy('name', 'ASC')->get();
		foreach( $tools as $t ){
			unset( $t->create_user );
			unset( $t->update_user );
		}
		return $tools;
	}

	// get by protected scoping
	//
	public function getProtected($projectUuid) {
		$toolTable = with(new Tool)->getTable();
		$toolSharingTable = with(new ToolSharing)->getTable();
		$tools = ToolSharing::where('project_uuid', '=', $projectUuid)
			->join($toolTable, $toolSharingTable.'.tool_uuid', '=', $toolTable.'.tool_uuid')
			->orderBy('name', 'ASC')->get();
		return $tools;
	}

	// get by project
	//
	public function getByProject($projectUuid) {
		/*
		$userUid = Session::get('user_uid');
		$connection = DB::connection('tool_shed');
		$pdo = $connection->getPdo();
		$stmt = $pdo->prepare("CALL list_tools_by_project_user(:userUid, :projectUuid, @returnString);");
		$stmt->bindParam(':userUid', $userUid, PDO::PARAM_STR, 45);
		$stmt->bindParam(':projectUuid', $projectUuid, PDO::PARAM_STR, 45);
		$stmt->execute();
		$results = array();

		do {
		    foreach( $stmt->fetchAll( PDO::FETCH_ASSOC ) as $row ){
				unset( $row['notes'] );
				$results[] = $row;
			}
		} while ( $stmt->nextRowset() );

		$select = $pdo->query('SELECT @returnString;');
		$returnString = $select->fetchAll( PDO::FETCH_ASSOC )[0]['@returnString'];
		$select->nextRowset();

		if( $returnString == 'SUCCESS' )
		    return $results;
		else
		    return Response::make( $returnString, 500 );
		*/
		    
		$publicTools = $this->getPublic();
		$protectedTools = $this->getProtected($projectUuid);
		return $publicTools->merge($protectedTools);
	}

	// get versions
	//
	public function getVersions($toolUuid) {
		$toolVersions = ToolVersion::where('tool_uuid', '=', $toolUuid)->get();
		return $toolVersions;
	}

	// get sharing
	//
	public function getSharing($toolUuid) {
		$toolSharing = ToolSharing::where('tool_uuid', '=', $toolUuid)->get();
		$projectUuids = array();
		for ($i = 0; $i < sizeof($toolSharing); $i++) {
			array_push($projectUuids, $toolSharing[$i]->project_uuid);
		}
		return $projectUuids;
	}

	// get policy
	//
	public function getPolicy($toolUuid) {
		$tool = Tool::where('tool_uuid', '=', $toolUuid)->first();
		if ($tool) {
			return $tool->getPolicy();
		}
	}

	// get permission status
	//
	public function getToolPermissionStatus( $toolUuid ){
		$tool = Tool::where('tool_uuid', '=', $toolUuid)->first();
		$package = Input::has('package_uuid') ? Package::where('package_uuid','=',Input::get('package_uuid'))->first() : null;
		$project = Input::has('project_uid') ? Project::where('project_uid','=',Input::get('project_uid'))->first() : null;
		$user = Input::has('user_uid') ? User::getIndex( Input::get('user_uid') ) : User::getIndex( Session::get('user_uid') );

		// Parasoft tool
		//
		if ($tool->isParasoftTool()) {
			return $tool->getParasoftPermissionStatus($package, $project, $user);
		}

		return Response::json(array('success', true));
	}

	// update by index
	//
	public function updateIndex($toolUuid) {
		$tool = $this->getIndex($toolUuid);
		$tool->name = Input::get('name');
		$tool->tool_owner_uuid = Input::get('tool_owner_uuid');
		$tool->is_build_needed = Input::get('is_build_needed');
		$tool->tool_sharing_status = Input::get('tool_sharing_status');
		$tool->save();
		return $tool;
	}

	// update sharing by index
	//
	public function updateSharing($toolUuid) {

		// remove previous sharing
		//
		$toolSharings = ToolSharing::where('tool_uuid', '=', $toolUuid)->get();
		for ($i = 0; $i < sizeof($toolSharings); $i++) {
			$toolSharing = $toolSharings[$i];
			$toolSharing->delete();
		}

		// create new sharing
		//
		$input = Input::get('projects');
		$toolSharings = new Collection;
		for ($i = 0; $i < sizeOf($input); $i++) {
			$project = $input[$i];
			$projectUid = $project['project_uid'];
			$toolSharing = new ToolSharing(array(
				'tool_uuid' => $toolUuid,
				'project_uuid' => $projectUid
			));
			$toolSharing->save();
			$toolSharings->push($toolSharing);
		}
		return $toolSharings;
	}

	// delete by index
	//
	public function deleteIndex($toolUuid) {
		$tool = Tool::where('tool_uuid', '=', $toolUuid)->first();
		$tool->delete();
		return $tool;
	}

	// delete versions
	//
	public function deleteVersions($toolUuid) {
		$toolVersions = $this->getVersions($toolUuid);
		for ($i = 0; $i < sizeof($toolVersions); $i++) {
			$toolVersions[$i]->delete();
		}
		return $toolVersions;
	}
}
