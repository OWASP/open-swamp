<?php

namespace Models\Users;

use PDO;

use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Session;
use Models\BaseModel;
use Models\TimeStamped;
use Models\Utilities\LDAP;
use Models\Users\EmailVerification;
use Models\Users\UserPermission;
use Models\Users\UserAccount;
use Models\Users\UserEvent;
use Models\Users\LinkedAccount;
use Models\Admin\RestrictedDomain;
use Models\Projects\Project;
use Models\Projects\ProjectMembership;

class User extends TimeStamped implements UserInterface, RemindableInterface {

	/**
	 * database attributes
	 */
	public $primaryKey = 'user_id';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid',
		'first_name', 
		'last_name', 
		'preferred_name', 
		'username', 
		'password',
		'email', 
		'address',
		'phone',
		'affiliation'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'first_name', 
		'last_name', 
		'preferred_name', 
		'username', 
		'email', 
		'address',
		'phone',
		'affiliation',
		'email_verified_flag',
		'enabled_flag',
		'owner_flag',
		'ssh_access_flag',
		'admin_flag',
		'create_date',
		'update_date'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'email_verified_flag',
		'enabled_flag',
		'owner_flag',
		'ssh_access_flag',
		'admin_flag',
		'create_date',
		'update_date'
	);

	/**
	 * attribute visibility methods
	 */

	protected function getVisible() {
		$parentClass = get_parent_class($this);

		if ($parentClass != get_class()) {

			// subclasses
			//
			$visible = array_merge((new $parentClass)->getVisible(), $this->visible);
		} else {
			$visible = $this->visible;
		}

		// only expose user_uid's for the current user, admin users, or when creating new users
		//
		$currentUser = User::getIndex(Session::get('user_uid'));
		if ($this->isCurrent() || ($currentUser && $currentUser->isAdmin()) || $this->isNew) {
			array_push($visible, 'user_uid');
		}

		return $visible;
	}

	/**
	 * Get the unique identifier for the user.
	 *
	 * @return mixed
	 */
	public function getFullName() {
		return $this->first_name.' '.$this->last_name;
	}

	/**
	 * new user validation method
	 */

	public function isValid(&$errors, $anyEmail = false) {

		// check to see if username has been taken
		//
		$user = User::getByUsername($this->username);
		if ($user != null) {
			$errors[] = 'The username "'.$this->username.'" is already in use.';
		}

		// check to see if email address has been taken
		//
		$values = array();
		$email = $this->email;
		if (preg_match("/(\w*)(\+.*)(@.*)/", $this->email, $values)) {
			$email = $values[1] . $values[3];
		}
		foreach (self::getAll() as $registered_user) {
			$values = array();
			if (preg_match("/(\w*)(\+.*)(@.*)/", $registered_user->email, $values)) {
				$registered_user->email = $values[1] . $values[3];
			}
			if (strtolower($email) == strtolower( $registered_user->email)) {
				$errors[] = 'The email address "'.$this->email.'" is already in use.';
				break;
			}
		}

		// promo code presence check
		//
		$promo_found = false;
		if (Input::has('promo')) {
			$pdo = DB::connection('mysql')->getPdo();
			$sth = $pdo->prepare('SELECT * FROM project.promo_code WHERE promo_code = :promo AND expiration_date > NOW()');
			$sth->execute(array(':promo' => Input::get('promo')));
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			if (($result == false) || (sizeof($result) < 1)) {
				if (!Input::has('email-verification')) {
					$errors[] = '"'. Input::get('promo') . '" is not a valid SWAMP promotional code or has expired.';
				}
			} else {
				$promo_found = true;
			}
		}

		// user_external_id presense check
		//
		$user_external_id = Input::has('user_external_id');

		// check to see if the domain name is valid
		//
		if (!$promo_found && ! $user_external_id && ($anyEmail !== true)) {
			$domain = User::getEmailDomain($this->email);
			if (!User::isValidEmailDomain($domain)) {
				$errors[] = 'Email addresses from "'.$domain.'" are not allowed.';
			}
		}

		return (sizeof($errors) == 0);
	}

	/**
	 * user verification methods
	 */

	public function getEmailVerification() {
		return EmailVerification::where('user_uid', '=', $this->user_uid)->first();
	}

	public function hasBeenVerified() {
		return $this->email_verified_flag == '1';
	}

	/**
	 * querying methods
	 */

	public function isCurrent() {
		return $this->user_uid == Session::get('user_uid');
	}

	public function isAdmin() {
		$userAccount = $this->getUserAccount();
		return ($userAccount && (strval($userAccount->admin_flag) == '1'));
	}

	public function isOwner() {
		return $this->getOwnerFlagAttribute();
	}

	public function isEnabled() {
		$userAccount = $this->getUserAccount();
		return ($userAccount && (strval($userAccount->enabled_flag) == '1'));
	}

	public function getUserAccount() {
		return UserAccount::where('user_uid', '=', $this->user_uid)->first();
	}

	public function getOwnerPermission() {
		return UserPermission::where('user_uid', '=', $this->user_uid)->where('permission_code', '=', 'project-owner')->first();
	}

	public function getTrialProject() {
		return Project::where('project_owner_uid', '=', $this->user_uid)->where('trial_project_flag', '=', 1)->first();
	}

	public function getProjects() {
		if (Config::get('model.database.use_stored_procedures')) {

			// execute stored procedure
			//
			return $this->PDOListProjectsByMember();
		} else {

			// execute SQL query
			//
			$projectMemberships = ProjectMembership::where('user_uid', '=', $this->user_uid)->get();
			$projects = new Collection;
			$projects->push($this->getTrialProject());
			for ($i = 0; $i < sizeOf($projectMemberships); $i++) {
				$projectMembership = $projectMemberships[$i];
				$projectUid = $projectMembership['project_uid'];
				$project = Project::where('project_uid', '=', $projectUid)->first();
				if ($project != null && $project->isActive()) {
				 	$projects->push($project);
				}
			}
			$projects = $projects->reverse();
			return $projects;
		}
	}

	public function hasProjectMembership( $projectMembershipUid ){
		$projectMembership = ProjectMembership::where('membership_uid', '=', $projectMembershipUid)->first();
		if ($projectMembership) {
			if (!$projectMembership->delete_date) {
				return true;
			}
		}
		return false;
	}

	public function isProjectMember($projectUid) {

		// check to see if user is the owner
		//
		$project = Project::where('project_uid', '=', $projectUid)->first();
		if ($project && $project->isOwnedBy($this)) {
			return true;
		}

		// check project memberships for this user
		//
		$projectMemberships = ProjectMembership::where('user_uid', '=', $this->user_uid)->get();
		foreach($projectMemberships as $projectMembership) {
			if ($projectMembership->project_uid == $projectUid) {
				if ($projectMembership->isActive()) {
					return true;
				}
			}
		}
		return false;
	}

	public function isProjectAdmin($uid) {

		// check project membership for this user
		//
		$projectMemberships = ProjectMembership::where('user_uid', '=', $this->user_uid)->get();
		foreach ($projectMemberships as $projectMembership) {
			if (($projectMembership->project_uid == $uid) && ($projectMembership->admin_flag == 1)) {
				if (!$projectMembership->delete_date) {
					return true;
				}	
			}	
		}
		return false;
	}

	//
	// authorization methods
	//

	/**
	 * Get the unique identifier for the user.
	 *
	 * @return mixed
	 */
	public function getAuthIdentifier() {
		return $this->getKey();
	}

	/**
	 * Get the password for the user.
	 *
	 * @return string
	 */
	public function getAuthPassword() {
		return $this->password;
	}

	//
	// email related methods
	//

	/**
	 * Get the e-mail address where password reminders are sent.
	 *
	 * @return string
	 */
	public function getReminderEmail() {
		return $this->email;
	}

	public function getRememberToken() {
	}

	public function setRememberToken($value) {
	}

	public function getRememberTokenName() {
	}

	//
	// utility functions
	//

	static function getEmailDomain($email) {
		$domain = implode('.',
			array_slice( preg_split("/(\.|@)/", $email), -2)
		);
		return strtolower($domain);
	}

	static function isValidEmailDomain($domain) {
		$restrictedDomainNames = RestrictedDomain::getRestrictedDomainNames();
		return !in_array($domain, $restrictedDomainNames);
	}

	//
	// password encrypting functons
	//

	public static function getEncryptedPassword($password, $encryption, $hash) {
		switch ($encryption) {

			case '{MD5}':
				return '{MD5}'.base64_encode(md5($password,TRUE));
				break;

			case '{SHA1}':
				return '{SHA}'.base64_encode(sha1($password, TRUE ));
				break;

			case '{SSHA}':
				$salt = substr(base64_decode(substr($hash, 6)), 20);
				return '{SSHA}'.base64_encode(sha1($password.$salt, TRUE ).$salt);
				break;

			default: 
				echo "Unsupported password hash format";
				return FALSE;
				break;
		}
	}

	public static function isValidPassword($password, $hash) {

		// no password
		//
		if ($hash == '') {
			return FALSE;
		}

		// plaintext password
		//
		if ($hash{0} != '{') {
			if ($password == $hash) {
				return TRUE;
			}
			return FALSE;
		}

		// crypt
		//
		if (substr($hash,0,7) == '{crypt}') {
			if (crypt($password, substr($hash,7)) == substr($hash,7)) {
				return TRUE;
			}
			return FALSE;

		// md5 
		//
		} elseif (substr($hash,0,5) == '{MD5}') {
			$encryptedPassword = User::getEncryptedPassword($password, '{MD5}');

		// sha1
		//
		} elseif (substr($hash,0,6) == '{SHA1}') {
			$encryptedPassword = User::getEncryptedPassword($password, '{SHA1}');
		}

		// ssha
		//
		elseif (substr($hash,0,6) == '{SSHA}') {
			$encryptedPassword = User::getEncryptedPassword($password, '{SSHA}', $hash);

		// unsupported
		//		
		} else {
			echo "Unsupported password hash format";
			return FALSE;
		}

		if ($hash == $encryptedPassword) {
			return TRUE;
		}

		return FALSE;
	}

	//
	// querying methods
	//

	public static function getIndex($userUid) {

		// check to see if there is an LDAP connection for this environment
		//
		$ldapConnectionConfig = Config::get('ldap.connections.'.App::environment());
		if ($ldapConnectionConfig != null) {

			// use LDAP
			//
			return LDAP::getIndex($userUid);
		} else {

			// use SQL / Eloquent
			//
			return User::where('user_uid', '=', $userUid)->first();
		}
	}

	public static function getByUsername($username) {

		// check to see if there is an LDAP connection for this environment
		//
		$ldapConnectionConfig = Config::get('ldap.connections.'.App::environment());
		if ($ldapConnectionConfig != null) {

			// use LDAP
			//
			return LDAP::getByUsername($username);
		} else {

			// use SQL / Eloquent
			//
			return User::where('username', '=', $username)->first();
		}
	}

	public static function getByEmail($email) {

		// check to see if there is an LDAP connection for this environment
		//
		$ldapConnectionConfig = Config::get('ldap.connections.'.App::environment());
		if ($ldapConnectionConfig != null) {

			// use LDAP
			//
			return LDAP::getByEmail($email);
		} else {

			// use SQL / Eloquent
			//
			return User::where('email', '=', $email)->first();
		}
	}

	public static function getAll() {

		// check to see if there is an LDAP connection for this environment
		//
		$ldapConnectionConfig = Config::get('ldap.connections.'.App::environment());
		if ($ldapConnectionConfig) {

			// use LDAP
			//
			return LDAP::getAll();
		} else {

			// use SQL / Eloquent
			//
			return User::all();
		}
	}

	//
	// overridden LDAP model methods
	//

	public function add() {

		// check to see if there is an LDAP connection for this environment
		//
		$ldapConnectionConfig = Config::get('ldap.connections.'.App::environment());
		if ($ldapConnectionConfig) {

			// use LDAP
			//
			LDAP::add($this);
		} else {

			// use SQL / Eloquent
			//
			$this->save();
		}

		// check for promo code information 
		//
		$promoCodeId = null;
		if (Input::has('promo')) {
			$pdo = DB::connection('mysql')->getPdo();
			$sth = $pdo->prepare('SELECT * FROM project.promo_code WHERE promo_code = :promo AND expiration_date > NOW()');
			$sth->execute(array(':promo' => Input::get('promo')));
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			$promoCodeId = ($result != false) && (sizeof($result) > 0) ? $result[0]['promo_code_id'] : null;
		}

		// create new user account
		//
		$userAccount = new UserAccount(array(
			'ldap_profile_update_date' => gmdate('Y-m-d H:i:s'),
			'user_uid' => $this->user_uid,
			'promo_code_id' => $promoCodeId,
			'enabled_flag' => 1,
			'owner_flag' => 0,
			'admin_flag' => 0,
			'email_verified_flag' => 0
		));
		$userAccount->save();

		// create linked account
		//
		if (Input::has('user_external_id') && Input::has('linked_account_provider_code')) {
			$linkedAccount = new LinkedAccount(array(
				'user_external_id' => Input::get('user_external_id'),
				'linked_account_provider_code' => Input::get('linked_account_provider_code'),
				'enabled_flag' => 1,
				'user_uid' => $this->user_uid,
				'create_date' => gmdate('Y-m-d H:i:s')
			));
			$linkedAccount->save();
			$userEvent = new UserEvent(array(
				'user_uid' => $this->user_uid,
				'event_type' => 'linkedAccountCreated',
				'value' => json_encode(array( 
					'linked_account_provider_code' => 'github', 
					'user_external_id' => $linkedAccount->user_external_id, 
					'user_ip' => $_SERVER['REMOTE_ADDR']
				))
			));
			$userEvent->save();
		}

		return $this;
	}

	public function modify() {

		// check to see if there is an LDAP connection for this environment
		//
		$ldapConnectionConfig = Config::get('ldap.connections.'.App::environment());
		if ($ldapConnectionConfig != null) {

			// use LDAP
			//
			return LDAP::save($this);
		} else {

			// use SQL / Eloquent
			//
			$this->save();

			return $this;
		}
	}

	public function modifyPassword($password) {

		// check to see if there is an LDAP connection for this environment
		//
		$ldapConnectionConfig = Config::get('ldap.connections.'.App::environment());
		if ($ldapConnectionConfig) {

			// use LDAP
			//
			return LDAP::modifyPassword($this, $password);
		} else {

			// encrypt password
			//
			$this->password = User::getEncryptedPassword($password, '{SSHA}', $this->password);

			// use SQL / Eloquent
			//
			$this->save();
			return $this;
		}
	}

	/**
	 * accessor methods
	 */

	public function getEmailVerifiedFlagAttribute() {
		$userAccount = $this->getUserAccount();
		if ($userAccount) {
			return $userAccount->email_verified_flag;
		}
	}

	public function getEnabledFlagAttribute() {
		$userAccount = $this->getUserAccount();
		if ($userAccount) {
			return $userAccount->enabled_flag;
		} else {
			return false;
		}
	}

	public function getOwnerFlagAttribute() {
		$ownerPermission = $this->getOwnerPermission();
		return $ownerPermission ? ($ownerPermission->getStatus() == 'granted' ? 1 : 0)  : 0;
	}

	public function getSshAccessFlagAttribute() {
		$sshAccessPermission = UserPermission::where('user_uid', '=', $this->user_uid)->where('permission_code', '=', 'ssh-access')->first();
		return $sshAccessPermission ? ($sshAccessPermission->getStatus() == 'granted' ? 1 : 0)  : 0;
	}

	public function getAdminFlagAttribute() {
		$userAccount = $this->getUserAccount();
		if ($userAccount) {
			return $userAccount->admin_flag;
		}
	}

	public function getCreateDateAttribute() {
		$userAccount = $this->getUserAccount();
		if ($userAccount) {
			return $userAccount->create_date;
		}
	}

	public function getUpdateDateAttribute() {
		$userAccount = $this->getUserAccount();
		if ($userAccount) {
			return $userAccount->update_date;
		}
	}

	//
	// PDO methods
	//

	private function PDOListProjectByMember() {

		// create stored procedure call
		//
		$connection = DB::connection('mysql');
		$pdo = $connection->getPdo();
		$userUuidIn = $this->user_uid;
		$stmt = $pdo->prepare("CALL list_projects_by_member(:userUuidIn, @returnString);");
		$stmt->bindParam(':userUuidIn', $userUuidIn, PDO::PARAM_STR, 45);
		$stmt->execute();
		$results = array();

		do {
			foreach( $stmt->fetchAll( PDO::FETCH_ASSOC ) as $row )
				$results[] = $row;
		} while ( $stmt->nextRowset() );

		$select = $pdo->query('SELECT @returnString;');
		$returnString = $select->fetchAll( PDO::FETCH_ASSOC )[0]['@returnString'];
		$select->nextRowset();

		$projects = new Collection();
		if ($returnString == 'SUCCESS') {
			foreach( $results as $result ) {
				$project = Project::where('project_uid', '=', $result['project_uid'])->first();
				$projects->push($project);
			}
		}
		return $projects;
	}
}
