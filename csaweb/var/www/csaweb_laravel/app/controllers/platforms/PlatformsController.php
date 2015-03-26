<?php

namespace Controllers\Platforms;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Models\Platforms\Platform;
use Models\Platforms\PlatformVersion;
use Models\Platforms\PlatformSharing;
use Models\Utilities\GUID;
use Models\Users\User;
use Controllers\BaseController;
use Filters\DateFilter;
use Filters\LimitFilter;

class PlatformsController extends BaseController {

	// create
	//
	public function postCreate() {
		$platform = new Platform(array(
			'platform_uuid' => GUID::create(),
			'name' => Input::get('name'),
			'platform_owner_uuid' => Input::get('platform_owner_uuid'),
			'platform_sharing_status' => Input::get('platform_sharing_status')
		));
		$platform->save();
		return $platform;
	}
	
	// get by index
	//
	public function getIndex($platformUuid) {
		$platform = Platform::where('platform_uuid', '=', $platformUuid)->first();
		return $platform;
	}

	// get by user
	//
	public function getByUser($userUuid) {
		$platforms = Platform::where('platform_owner_uuid', '=', $userUuid)->orderBy('name', 'ASC')->get();
		return $platforms;
	}

	// get all for admin user
	//
	public function getAll(){
		$user = User::getIndex(Session::get('user_uid'));
		if ($user && $user->isAdmin()) {
			$platformsQuery = Platform::orderBy('create_date', 'DESC');

			// add filters
			//
			$platformsQuery = DateFilter::apply($platformsQuery);
			$platformsQuery = LimitFilter::apply($platformsQuery);

			return $platformsQuery->get();
		}
		return '';
	}

	// get by public scoping
	//
	public function getPublic() {
		$platformsQuery = Platform::where('platform_sharing_status', '=', 'public')->orderBy('name', 'ASC');

		// add filters
		//
		$platformsQuery = DateFilter::apply($platformsQuery);
		$platformsQuery = LimitFilter::apply($platformsQuery);

		return $platformsQuery->get();
	}

	// get by protected scoping
	//
	public function getProtected($projectUuid) {
		$platformTable = with(new Platform)->getTable();
		$platformSharingTable = with(new PlatformSharing)->getTable();
		$platformsQuery = PlatformSharing::where('project_uuid', '=', $projectUuid)
			->join($platformTable, $platformSharingTable.'.platform_uuid', '=', $platformTable.'.platform_uuid')
			->orderBy('name', 'ASC');

		// add filters
		//
		$platformsQuery = DateFilter::apply($platformsQuery);
		$platformsQuery = LimitFilter::apply($platformsQuery);

		return $platformsQuery->get();
	}

	// get by project
	//
	public function getByProject($projectUuid) {
		$publicPlatforms = $this->getPublic();
		$protectedPlatforms = $this->getProtected($projectUuid);
		return $publicPlatforms->merge($protectedPlatforms);
	}

	// get versions
	//
	public function getVersions($platformUuid) {
		$platformVersions = PlatformVersion::where('platform_uuid', '=', $platformUuid)->get();
		foreach( $platformVersions as $p ){
			unset( $p->create_user );
			unset( $p->update_user );
			unset( $p->create_date );
			unset( $p->update_date );
			unset( $p->release_date );
			unset( $p->retire_date );
			unset( $p->notes );
			unset( $p->platform_path );
			unset( $p->checksum );
			unset( $p->invocation_cmd );
			unset( $p->deployment_cmd );
		}
		return $platformVersions;
	}

	// get sharing
	//
	public function getSharing($platformUuid) {
		$platformSharing = PlatformSharing::where('platform_uuid', '=', $platformUuid)->get();
		$projectUuids = array();
		for ($i = 0; $i < sizeof($platformSharing); $i++) {
			array_push($projectUuids, $platformSharing[$i]->project_uuid);
		}
		return $projectUuids;
	}

	// update by index
	//
	public function updateIndex($platformUuid) {
		$platform = $this->getIndex($platformUuid);
		$platform->name = Input::get('name');
		$platform->platform_owner_uuid = Input::get('platform_owner_uuid');
		$platform->platform_sharing_status = Input::get('platform_sharing_status');
		$platform->save();
		return $platform;
	}

	// update sharing by index
	//
	public function updateSharing($platformUuid) {

		// remove previous sharing
		//
		$platformSharings = PlatformSharing::where('platform_uuid', '=', $platformUuid)->get();
		for ($i = 0; $i < sizeof($platformSharings); $i++) {
			$platformSharing = $platformSharings[$i];
			$platformSharing->delete();
		}

		// create new sharing
		//
		$input = Input::get('projects');
		$platformSharings = new Collection;
		for ($i = 0; $i < sizeOf($input); $i++) {
			$project = $input[$i];
			$projectUid = $project['project_uid'];
			$platformSharing = new PlatformSharing(array(
				'platform_uuid' => $platformUuid,
				'project_uuid' => $projectUid
			));
			$platformSharing->save();
			$platformSharings->push($platformSharing);
		}
		return $platformSharings;
	}

	// delete by index
	//
	public function deleteIndex($platformUuid) {
		$platform = Platform::where('platform_uuid', '=', $platformUuid)->first();
		$platform->delete();
		return $platform;
	}

	// delete versions
	//
	public function deleteVersions($platformUuid) {
		$platformVersions = $this->getVersions($platformUuid);
		for ($i = 0; $i < sizeof($platformVersions); $i++) {
			$platformVersions[$i]->delete();
		}
		return $platformVersions;
	}
}
