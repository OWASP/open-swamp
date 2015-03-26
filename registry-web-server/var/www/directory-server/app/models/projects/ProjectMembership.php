<?php

namespace Models\Projects;

use Illuminate\Support\Facades\Config;
use Models\CreateStamped;

class ProjectMembership extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'membership_uid';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'membership_uid',
		'project_uid', 
		'user_uid',
		'admin_flag'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'membership_uid',
		'project_uid', 
		'user_uid',
		'admin_flag'
	);

	/**
	 * constructor
	 */

	public function __construct(array $attributes = array()) {

		// use custom table name
		//
		$this->table = $this->getTableName('ProjectUser');

		// call superclass constructor
		//
		parent::__construct($attributes);
	}

	//
	// querying methods
	//

	public function isActive() {
		return (!$this->delete_date);
	}

	//
	// methods
	//

	public static function deleteByUser($user) {
		if (Config::get('model.database.use_stored_procedures')) {

			// execute stored procedure
			//
			self::PDORemoveUserFromAllProjects($userUid);
		} else {

			// execute SQL query
			//
			self::where('user_uid', '=', $user->user_uid)->delete();
		}
	}

	//
	// PDO methods
	//

	private static function PDORemoveUserFromAllProjects($user) {

		// call stored procedure to remove all project associations
		//
		$connection = DB::connection('mysql');
		$pdo = $connection->getPdo();
		$stmt = $pdo->prepare("CALL remove_user_from_all_projects(:userUuidIn, @returnString);");
		$stmt->bindParam(':userUuidIn', $user->user_uid, PDO::PARAM_STR, 45);
		$stmt->execute();

		$select = $pdo->query('SELECT @returnString;');
		$returnString = $select->fetchAll( PDO::FETCH_ASSOC )[0]['@returnString'];
		$select->nextRowset();
	}
}
