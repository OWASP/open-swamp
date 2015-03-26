<?php

namespace Controllers\Packages;

use PDO;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Models\Packages\Package;
use Models\Packages\PackageVersion;
use Models\Packages\PackageVersionSharing;
use Models\Packages\PackageVersionDependency;
use Models\Packages\CPackageVersion;
use Models\Packages\JavaSourcePackageVersion;
use Models\Packages\JavaBytecodePackageVersion;
use Models\Packages\PythonPackageVersion;
use Models\Packages\AndroidSourcePackageVersion;
use Models\Utilities\GUID;
use Models\Utilities\Filename;
use Controllers\BaseController;

class PackageVersionsController extends BaseController {

	// post upload
	//
	public function postUpload() {
		if (Input::hasFile('file')) {
			$file = Input::file('file');
			$uploaded = $this->upload($file);

			if ($uploaded) {
				return $uploaded;
			} else {
				return Response::make('Error uploading file.', 400);
			}
		} else if( Input::has('external_url') ) {
			$url = Input::get('external_url');
			if( $this->acceptableExternalUrl( $url ) ){
				$uploaded = $this->upload( null, $url );
				if ($uploaded) {
					return $uploaded;
				} else {
					return Response::make('Error uploading file.', 400);
				}
			} else {
				return Response::make('External URL unacceptable.', 404);
			}

		} else if( Input::has('use_external_url') && Input::has('package_uuid') ) {
			$package = Package::where('package_uuid','=',Input::get('package_uuid'))->first();
			if( $package && $this->acceptableExternalUrl( $package->external_url ) ){
				$uploaded = $this->upload( null, $package->external_url );
				if ($uploaded) {
					return $uploaded;
				} else {
					return Response::make('Error uploading file.', 400);
				}
			} else {
				return Response::make('External URL unacceptable.', 404);
			}
		} else {
			return Response::make('No uploaded file.', 404);
		}
	}

	public function acceptableExternalUrl( $url ){
		return  preg_match('/^https:\/\/github.com\/.+\/.+\.git/', $url ) === 1;
	}

	public function postPackageVersionDependencies(){
		$dependencies = Input::get('data') ?: array();
		$results = new Collection();

		foreach( $dependencies as $pvd ){
			$p = new PackageVersionDependency( $pvd );
			$p->save();
			$results->push( $p );
		}
		return $results;
	}

	public function putPackageVersionDependencies(){
		$dependencies = Input::get('data') ?: array();
		$results = new Collection();
		foreach( $dependencies as $pvd ){
			$p = null;
			if( array_key_exists('package_version_dependency_id', $pvd) ){
				$p = PackageVersionDependency::where('package_version_dependency_id','=',$pvd['package_version_dependency_id'])->first();
				$p->dependency_list = $pvd['dependency_list'];
			}
			else
				$p = new PackageVersionDependency( $pvd );
			$p->save();
			$results->push( $p );
		}
		return $results;
	}

	public function getPackageVersionDependenciesByPackageVersion( $packageVersionUuid ){
		return PackageVersionDependency::where('package_version_uuid','=', $packageVersionUuid)->get() ?: array();
	}

	public function getMostRecentPackageVersionDependencies( $packageUuid ){
		$pv = PackageVersion::where('package_uuid','=',$packageUuid)->orderBy('create_date','desc')->first();
		return $pv ? PackageVersionDependency::where('package_version_uuid','=', $pv->package_version_uuid)->get() : array();
	}

	// post add
	//
	public function postAdd($packageVersionUuid) {
		$packagePath = Input::get('package_path');
		return $this->add($packageVersionUuid, $packagePath);
	}

	// create
	//
	public function postCreate() {
		$attributes = $this->getAttributes();

		// set creation attributes
		//
		$attributes['package_version_uuid'] = GUID::create();

		// create new package version
		//
		$packageVersion = new PackageVersion($attributes);
		$packageVersion->save();

		return $packageVersion;
	}

	// post store (add and create)
	//
	public function postStore() {
		return $this->store();
	}

	// post new
	//
	public function postAddNew() {
		$file = Input::file('file');
		$uploaded = $this->upload($file);
		$packagePath = $uploaded["destination_path"]."/".$uploaded["uploaded_file"];
		$package = $this->postCreate();
		return $this->add($package->package_version_uuid, $packagePath);
	}

	// get by index
	//
	public function getIndex($packageVersionUuid) {
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();
		return $packageVersion;
	}

	//
	// file archive methods for newly uploaded packages
	//

	// check contents
	//
	public function getNewContains() {
		$dirname = Input::get('dirname');
		$filename = Input::get('filename');

		// create package appropriate to package type
		//
		$packageVersion = new PackageVersion(array(
			'package_path' => Input::get('package_path')
		));

		if ($packageVersion) {
			return Response::json($packageVersion->contains($dirname, $filename));
		} else {
			return Response::make("Unable to check contents for package type ".$packageTypeId.".", 400);
		}
	}

	// infer build system from contents
	//
	public function getNewBuildSystem() {

		// create package appropriate to package type
		//
		$attributes = $this->getAttributes();
		$packageTypeId = $this->getPackageTypeId($attributes);
		$packageVersion = $this->getNewPackageVersion($packageTypeId, $attributes);
		if ($packageVersion) {
			return $packageVersion->getBuildSystem();
		} else {
			return Response::make("Unable to get build system for package type ".$packageTypeId.".", 400);
		}
	}

	// get inventory of files types in the archive
	//
	public function postNewFileTypes() {
		$dirname = Input::get('dirname');

		// create new package version
		//
		$packageVersion = new PackageVersion(array(
			'package_path' => Input::get('package_path')
		));

		return $packageVersion->getFileTypes($dirname);
	}

	// get file list
	//
	public function getNewFileInfoList() {
		$dirname = Input::get('dirname');
		$filter = Input::get('filter');

		// create new package version
		//
		$packageVersion = new PackageVersion(array(
			'package_path' => Input::get('package_path')
		));

		return $packageVersion->getFileInfoList($dirname, $filter);
	}

	// get file tree
	//
	public function getNewFileInfoTree() {
		$dirname = Input::get('dirname');
		$filter = Input::get('filter');

		// create new package version
		//
		$packageVersion = new PackageVersion(array(
			'package_path' => Input::get('package_path')
		));

		return $packageVersion->getFileInfoTree($dirname, $filter);
	}

	// get directory list
	//
	public function getNewDirectoryInfoList() {
		$dirname = Input::get('dirname');
		$filter = Input::get('filter');

		// create new package version
		//
		$packageVersion = new PackageVersion(array(
			'package_path' => Input::get('package_path')
		));

		return $packageVersion->getDirectoryInfoList($dirname, $filter);
	}

	// get directory tree
	//
	public function getNewDirectoryInfoTree() {
		$dirname = Input::get('dirname');
		$filter = Input::get('filter');

		// create new package version
		//
		$packageVersion = new PackageVersion(array(
			'package_path' => Input::get('package_path')
		));

		return $packageVersion->getDirectoryInfoTree($dirname, $filter);
	}

	//
	// file archive methods for existing packages
	//

	// check contents
	//
	public function getContains() {
		$dirname = Input::get('dirname');
		$filename = Input::get('filename');

		// create package appropriate to package type
		//
		$packageTypeId = $packageVersion->package_type_id;
		$packageVersion = $this->getNewPackageVersion($packageTypeId, null);
		if ($packageVersion) {
			return $packageVersion->contains($dirname, $filename);
		} else {
			return Response::make("Unable to check contents for package type ".$packageTypeId.".", 400);
		}
	}

	// infer build system from contents
	//
	public function getBuildSystem($packageVersionUuid) {

		// find package version
		//
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();

		// create package appropriate to package type
		//
		$packageTypeId = $packageVersion->package_type_id;
		$packageVersion = $this->getNewPackageVersion($packageTypeId, null);
		if ($packageVersion) {
			return $packageVersion->getBuildSystem();
		} else {
			return Response::make("Unable to get build system for package type ".$packageTypeId.".", 400);
		}
	}

	// get inventory of files types in the archive
	//
	public function postFileTypes($packageVersionUuid) {
		$dirname = Input::get('dirname');

		// find package version
		//
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();

		return $packageVersion->getFileTypes($dirname);
	}

	// get file list
	//
	public function getFileInfoList($packageVersionUuid) {
		$dirname = Input::get('dirname');
		$filter = Input::get('filter');

		// find package version
		//
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();

		return $packageVersion->getFileInfoList($dirname, $filter);
	}

	// get file tree
	//
	public function getFileInfoTree($packageVersionUuid) {
		$dirname = Input::get('dirname');
		$filter = Input::get('filter');

		// find package version
		//
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();

		return $packageVersion->getFileInfoTree($dirname, $filter);
	}

	// get directory list
	//
	public function getDirectoryInfoList($packageVersionUuid) {
		$dirname = Input::get('dirname');
		$filter = Input::get('filter');

		// find package version
		//
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();

		return $packageVersion->getDirectoryInfoList($dirname, $filter);
	}

	// get directory tree
	//
	public function getDirectoryInfoTree($packageVersionUuid) {
		$dirname = Input::get('dirname');
		$filter = Input::get('filter');

		// find package version
		//
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();

		return $packageVersion->getDirectoryInfoTree($dirname, $filter);
	}

	//
	// sharing methods
	//

	// get sharing
	//
	public function getSharing($packageVersionUuid) {
		$packageVersionSharing = PackageVersionSharing::where('package_version_uuid', '=', $packageVersionUuid)->get();
		$projectUuids = array();
		for ($i = 0; $i < sizeof($packageVersionSharing); $i++) {
			array_push($projectUuids, $packageVersionSharing[$i]->project_uuid);
		}
		return $projectUuids;
	}

	// update sharing by index
	//
	public function updateSharing($packageVersionUuid) {

		// remove previous sharing
		//
		$packageVersionSharings = PackageVersionSharing::where('package_version_uuid', '=', $packageVersionUuid)->get();
		foreach ($packageVersionSharings as $packageVersionSharing) {
			$packageVersionSharing->delete();
		}

		// create new sharing
		//
		$projects = Input::get('projects');
		$packageVersionSharings = array();
		if ($projects) {
			foreach($projects as $project) {
				$projectUid = $project['project_uid'];
				$packageVersionSharing = new PackageVersionSharing(array(
					'package_version_uuid' => $packageVersionUuid,
					'project_uuid' => $projectUid
				));
				$packageVersionSharing->save();
				$packageVersionSharings[] = $packageVersionSharing;
			}
		}
		return $packageVersionSharings;
	}

	// update by index
	//
	public function updateIndex($packageVersionUuid) {
		$packageVersion = $this->getIndex($packageVersionUuid);
		$packageVersion->package_version_uuid = Input::get('package_version_uuid');
		$packageVersion->package_uuid = Input::get('package_uuid');

		// update version attributes
		//
		$packageVersion->version_string = Input::get('version_string');
		$packageVersion->version_sharing_status = Input::get('version_sharing_status');

		// update date / details attributes
		//
		$packageVersion->release_date = Input::get('release_date');
		$packageVersion->retire_date = Input::get('retire_date');
		$packageVersion->notes = Input::get('notes');

		// update path attributes
		//
		$packageVersion->source_path = Input::get('source_path');

		// update config attributes
		//
		$packageVersion->config_dir = Input::get('config_dir');
		$packageVersion->config_cmd = Input::get('config_cmd');
		$packageVersion->config_opt = Input::get('config_opt');

		// update build attributes
		//
		$packageVersion->build_file = Input::get('build_file');
		$packageVersion->build_system = Input::get('build_system');
		$packageVersion->build_target = Input::get('build_target');

		$packageVersion->build_dir = Input::get('build_dir');
		$packageVersion->build_cmd = Input::get('build_cmd');
		$packageVersion->build_opt = Input::get('build_opt');

		// update java bytecode attributes
		//
		$packageVersion->bytecode_class_path = Input::get('bytecode_class_path');
		$packageVersion->bytecode_aux_class_path = Input::get('bytecode_aux_class_path');
		$packageVersion->bytecode_source_path = Input::get('bytecode_source_path');

		// update android attributes
		//
		$packageVersion->android_sdk_target = Input::get('android_sdk_target');
		$packageVersion->android_redo_build = Input::get('android_redo_build');

		$packageVersion->save();
		return $packageVersion;
	}

	// download package
	//
	public function getDownload($packageVersionUuid) {
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();
		$packagePath = $packageVersion->package_path;

		// set download parameters
		//
		$filename = basename($packagePath);
		$headers = array(
			  'content-type: application/octet-stream'
		);

		// download and return file
		//
		return Response::download($packagePath, $filename, $headers);
	}

	// delete by index
	//
	public function deleteIndex($packageVersionUuid) {
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();
		$packageVersion->delete();
		return $packageVersion;
	}

	// post build system check
	//
	public function postBuildSystemCheck() {
		$attributes = $this->getAttributes();

		// create package appropriate to package type
		//
		$packageTypeId = $this->getPackageTypeId($attributes);
		$packageVersion = $this->getNewPackageVersion($packageTypeId, $attributes);

		// look up package path for existing packages
		//
		if ($attributes['package_version_uuid']) {
			$existingPackageVersion = PackageVersion::where("package_version_uuid", "=", $attributes['package_version_uuid'])->first();
			$packageVersion->package_path = $existingPackageVersion->package_path;
		}

		// check build system
		//
		if ($packageVersion) {
			return $packageVersion->checkBuildSystem();
		} else {
			return Response::make("Unable to check build system for package type ".$packageTypeId.".", 400);
		}
	}

	//
	// private utility methods
	//

	private function getNewPackageVersion($packageTypeId, $attributes) {
		switch ($packageTypeId) {
			case 1:
				return new CPackageVersion($attributes);
				break;
			case 2:
				return new JavaSourcePackageVersion($attributes);
				break;
			case 3:
				return new JavaBytecodePackageVersion($attributes);
				break;
			case 4:
				return new PythonPackageVersion($attributes);
				break;
			case 5:
				return new PythonPackageVersion($attributes);
				break;
			case 6:
				return new AndroidSourcePackageVersion($attributes);
				break;
			default:
				return null;
				break;
		}
	}

	private function getPackageTypeId($attributes) {

		// get package type id
		//
		if (Input::get('package_uuid') != NULL) {

			// existing packages
			//
			$package = Package::where('package_uuid', '=', $attributes['package_uuid'])->first();
			return $package->package_type_id;
		} else {

			// new packages
			//
			return Input::get('package_type_id');
		}
	}

	private function getAttributes() {
		return array(
			'package_version_uuid' => Input::get('package_version_uuid'),
			'package_uuid' => Input::get('package_uuid'),
			'version_string' => Input::get('version_string'),
			'version_sharing_status' => Input::get('version_sharing_status'),

			// date / detail attributes
			//
			'release_date' => Input::get('release_date'),
			'retire_date' => Input::get('retire_date'),
			'notes' => Input::get('notes'),

			// package path attributes
			//
			'package_path' => Input::get('package_path'),
			'source_path' => Input::get('source_path'),

			// config attributes
			//
			'config_dir' => Input::get('config_dir'),
			'config_cmd' => Input::get('config_cmd'),
			'config_opt' => Input::get('config_opt'),

			// build attributes
			//
			'build_file' => Input::get('build_file'),
			'build_system' => Input::get('build_system'),
			'build_target' => Input::get('build_target'),

			'build_dir' => Input::get('build_dir'),
			'build_cmd' => Input::get('build_cmd'),
			'build_opt' => Input::get('build_opt'),

			// java bytecode attributes
			//
			'bytecode_class_path' => Input::get('bytecode_class_path'),
			'bytecode_aux_class_path' => Input::get('bytecode_aux_class_path'),
			'bytecode_source_path' => Input::get('bytecode_source_path'),

			// android attributes
			//
			'android_sdk_target' => Input::get('android_sdk_target'),
			'android_redo_build' => Input::get('android_redo_build')
		);
	}

	private function upload($file, $external_url = false) {
		$filename = null;
		$path = null;
		$extension = null;
		$mime = null;
		$size = 0;
		$workdir = false;

		// If the file is located externally, retrieve it
		//
		if( $external_url ){

			$workdir = '/tmp/' . uniqid();
			$external_url = escapeshellcmd( $external_url );


			// In the future, replace this with a method to
			// pull repositories as needed.
			//
			$result = `mkdir $workdir;
			 cd $workdir;
			 git clone $external_url`;

			$files = scandir( $workdir );
			if( sizeof( $files ) !== 3 ){
				`rm -rf $workdir;`;
				return Response::make('Not a single directory.', 404);
			}

			`tar -zcf $workdir/$files[2].tar.gz -C $workdir/$files[2] .`;

			if( ! file_exists("$workdir/$files[2].tar.gz") ){
				return Response::make('Unable to tar project directory', 404);
			}

			$filename = Filename::sanitize($files[2]).'.tar.gz';
			$path = "$workdir/$files[2].tar.gz";
			$extension = 'tar.gz';
			$mime = 'applization/x-gzip';
			$size = filesize("$workdir/$files[2].tar.gz");

			// move file to destination
			//
			// $destinationFolder = str_random(8);
			$destinationFolder = GUID::create();
			$destinationPath = PackageVersion::$incoming.$destinationFolder;

			`mkdir -p $destinationPath`;

			`mv $workdir/$files[2].tar.gz $destinationPath/$filename`;

			$uploadSuccess = file_exists("$destinationPath/$filename");

		} else {

			// query uploaded file
			//
			$filename = $file->getClientOriginalName();
			$path = $file->getRealPath();
			$extension = $file->getClientOriginalExtension();
			$mime = $file->getMimeType();
			$size = $file->getSize();

			// replace spaces in filename with dashes
			//
			$filename = Filename::sanitize($filename);

			// replace extension with original extension
			//
			if ($extension && $extension != '') {
				$filename = pathinfo($filename, PATHINFO_FILENAME).'.'.$extension;
			}

			// move file to destination
			//
			// $destinationFolder = str_random(8);
			$destinationFolder = GUID::create();
			$destinationPath = PackageVersion::$incoming.$destinationFolder;
			$uploadSuccess = $file->move($destinationPath, $filename);

		}

		if( $workdir ){
			`rm -rf $workdir`;
		}

		if ($uploadSuccess) {
			return array(
				'uploaded_file' => $filename,
				'path' => $path,
				'extension' => $extension,
				'mime' => $mime,
				'size' => $size,
				'destination_path' => $destinationFolder
			);
		} else {
			return Response::make("Could not upload file.", 500);
		}
	}

	private function add($packageVersionUuid, $packagePath) {
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();

		// create stored procedure call
		//
		$connection = DB::connection('package_store');
		$pdo = $connection->getPdo();
		$stmt = $pdo->prepare("CALL add_package_version(
			:packageVersionUuid, :packagePath, @returnStatus, @returnMsg);");

		// bind params
		//
		$stmt->bindParam(":packageVersionUuid", $packageVersionUuid, PDO::PARAM_STR, 45);
		$stmt->bindParam(":packagePath", $packagePath, PDO::PARAM_STR, 200);

		// set param values
		//
		$returnStatus = null;
		$returnMsg = null;

		// call stored procedure
		//
		$results = $stmt->execute();

		// fetch return parameters
		//
		$select = $pdo->query('SELECT @returnStatus, @returnMsg');
		$results = $select->fetchAll();
		$returnStatus = $results[0]["@returnStatus"];
		$returnMsg = $results[0]["@returnMsg"];

		// delete package version if error
		//
		if ($returnStatus == 'ERROR') {
			$packageVersion->delete();
		}

		// remove file and directory
		//
		unlink(PackageVersion::$incoming.$packagePath);
		rmdir(dirname(PackageVersion::$incoming.$packagePath));

		// return values
		//
		return Response::make( $returnMsg, $returnStatus == 'ERROR' ? 500 : 200 );
	}

	private function store() {
		$attributes = $this->getAttributes();
		$packagePath = $attributes['package_path'];
		$packageUuid = $attributes['package_uuid'];

		// create stored procedure call
		//
		$connection = DB::connection('package_store');
		$pdo = $connection->getPdo();
		$stmt = $pdo->prepare("CALL store_package_version(
			:packageUuidIn, :packagePathIn, @packagePathOut, @checksum, @returnStatus, @returnMsg);");

		// bind params
		//
		$stmt->bindParam(":packageUuidIn", $packageUuid, PDO::PARAM_STR, 45);
		$stmt->bindParam(":packagePathIn", $packagePath, PDO::PARAM_STR, 200);

		// set param values
		//
		$checksum = null;
		$returnStatus = null;
		$returnMsg = null;

		// call stored procedure
		//
		$results = $stmt->execute();

		// fetch return parameters
		//
		$select = $pdo->query('SELECT @packagePathOut, @checksum, @returnStatus, @returnMsg');
		$results = $select->fetchAll();
		$packagePathOut = $results[0]["@packagePathOut"];
		$checksum = $results[0]["@checksum"];
		$returnStatus = $results[0]["@returnStatus"];
		$returnMsg = $results[0]["@returnMsg"];

		// remove file and directory
		//
		// unlink(PackageVersion::$incoming.$packagePath);
		// rmdir(dirname(PackageVersion::$incoming.$packagePath));

		// create new package version if successful
		//
		if ($returnStatus == "SUCCESS") {

			// create new package version
			//
			$packageVersion = new PackageVersion($attributes);

			// set creation attributes
			//
			$packageVersion->package_version_uuid = GUID::create();
			$packageVersion->package_path = $packagePathOut;
			$packageVersion->checksum = $checksum;

			$packageVersion->save();

			return $packageVersion;
		} else {

			// return values
			//
			return Response::make( $returnMsg, $returnStatus == 'ERROR' ? 500 : 200 );
		}
	}
}
