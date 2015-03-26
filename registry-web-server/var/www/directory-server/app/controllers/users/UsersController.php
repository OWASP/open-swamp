<?php

namespace Controllers\Users;

use PDO;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Models\Users\User;
use Models\Users\EmailVerification;
use Models\Users\PasswordReset;
use Models\Users\UserPermission;
use Models\Users\Permission;
use Models\Projects\Project;
use Models\Projects\ProjectMembership;
use Models\Utilities\GUID;
use Controllers\BaseController;
use Filters\DateFilter;
use Filters\LimitFilter;

class UsersController extends BaseController {

	// create
	//
	public function postCreate() {
		$user = new User(array(
			'first_name' => Input::get('first_name'),
			'last_name' => Input::get('last_name'),
			'preferred_name' => Input::get('preferred_name'),
			'username' => Input::get('username'),
			'password' => Input::get('password'),
			'user_uid' => GUID::create(),
			'email' => Input::get('email'),
			'address' => Input::get('address'),
			'phone' => Input::get('phone'),
			'affiliation' => Input::get('affiliation')
		));
		$user->add();
		$user->isNew = true;

		// return response
		//
		return $user;
	}

	// check validity
	//
	public function postValidate() {
		$user = new User(array(
			'first_name' => Input::get('first_name'),
			'last_name' => Input::get('last_name'),
			'preferred_name' => Input::get('preferred_name'),
			'username' => Input::get('username'),
			'password' => Input::get('password'),
			'user_uid' => GUID::create(),
			'email' => Input::get('email'),
			'address' => Input::get('address'),
			'phone' => Input::get('phone'),
			'affiliation' => Input::get('affiliation')
		));
		$errors = array();

		// return response
		//
		if ($user->isValid($errors)) {
			return Response::json(array('success' => true));
		} else {
			return Response::make(json_encode($errors), 409);
		}
	}

	// get by index
	//
	public function getIndex($userUid) {

		// get current user
		//
		if ($userUid == 'current') {
			$userUid = Session::get('user_uid');
		}
		$user = User::getIndex($userUid);

		// return response
		//
		if ($user != null) {
			return $user;
		} else {
			return Response::make('User not found.', 404);
		}
	}

	// get by username
	//
	public function getUserByUsername() {

		// get parameters
		//
		$username = Input::get('username');

		// query database
		//
		$user = User::getByUsername($username);

		// return response
		//
		if ($user != null) {
			return $user;
		} else {
			return Response::make('Could not find a user associated with the username: '.$username, 404);
		}
	}

	// get by email address
	//
	public function getUserByEmail() {

		$user = User::getIndex(Session::get('user_uid'));
		if( ! $user ){
			return Response::make('Access prohibited.'.$email, 401);
		}	
		if( ! $user->isAdmin() ){
			return Response::make('Access prohibited.'.$email, 401);
		}	

		// get parameters
		//
		$email = Input::get('email');

		// query database
		//
		$user = User::getByEmail($email);

		// return response
		//
		if ($user != null) {
			return $user;
		} else {
			return Response::make('Could not find a user associated with the email address: '.$email, 404);
		}
	}

	// request an email containing the username for a given email address
	//
	public function requestUsername() {

		// get parameters
		//
		$email = Input::get('email');

		// query database
		//
		$this->user = User::getByEmail($email);

		// send email notification
		//
		if ($this->user != null) {
			Mail::send('emails.request-username', array( 'user' => $this->user ), function($message) {
				$message->to( $this->user->email, $this->user->getFullName() );
				$message->subject('SWAMP Username Request');
			});
		}

		// return response
		//
		return Response::json( array( 'success' => true ) );
	}

	// get all
	//
	public function getAll($userUid) {
		$user = User::getIndex($userUid);
		if ($user) {
			if ($user->isAdmin()) {

				// check to see if there is an LDAP connection for this environment
				//
				$ldapConnectionConfig = Config::get('ldap.connections.'.App::environment());
				if ($ldapConnectionConfig != null) {

					// use LDAP
					//
					$users = User::getAll();

					// sort by date
					//			
					$users->sortByDesc('create_date');

					// add date filter
					//
					$users = self::filterByDate($users);

					// add limit filter
					//
					$limit = Input::get('limit');
					if ($limit != '') {
						$users = $users->slice(0, $limit);
					}
				} else {

					// use SQL
					//
					$usersQuery = User::orderBy('create_date', 'DESC');

					// add filters
					//
					$usersQuery = DateFilter::apply($usersQuery);
					$usersQuery = LimitFilter::apply($usersQuery);

					$users = $usersQuery->get();
				}

				return $users;
			} else {
				return Response::make('This user is not an administrator.', 500);
			}
		} else {
			return Response::make('Administrator authorization is required.', 500);
		}
	}

	// update by index
	//
	public function updateIndex($userUid) {
		$user = User::getIndex($userUid);
		if (!$user) {
			return Response('Could not find user.', 500);
		}

		// send verification email
		//
		if ($user->email != Input::get('email')) {
			$emailVerification = new EmailVerification(array(
				'user_uid' => $user->user_uid,
				'verification_key' => GUID::create(),
				'email' => Input::get('email')
			));
			$emailVerification->save();
			$emailVerification->send('#verify-email', true); 
		}

		// set attributes
		//
		$user->first_name = Input::get('first_name');
		$user->last_name = Input::get('last_name');
		$user->preferred_name = Input::get('preferred_name');
		$user->username = Input::get('username');
		$user->address = Input::get('address');
		$user->phone = Input::get('phone');
		$user->affiliation = Input::get('affiliation');

		// update user
		//
		$user->modify();

		// get meta attributes
		//
		$attributes = array(
			'email_verified_flag' => Input::get('email_verified_flag'),
			'enabled_flag' => Input::get('enabled_flag'),
			'owner_flag' => Input::get('owner_flag'),
			'admin_flag' => Input::get('admin_flag')
		);

		// update meta attributes
		//
		$currentUser = User::getIndex(Session::get('user_uid'));
		if ($currentUser && $currentUser->isAdmin()) {

			// update user account
			//
			$userAccount = $user->getUserAccount();
			if ($userAccount) {
				$userAccount->setAttributes($attributes, $user);
			}
		}

		// return response
		//
		return $user;
	}

	// change password
	//
	public function changePassword($userUid) {
		$currentUser = User::getIndex(Session::get('user_uid'));
		$user = User::getIndex($userUid);

		// current user is an admin
		//
		if ($currentUser->isAdmin() && ( $userUid != $currentUser->user_uid ) ) {
			$newPassword = Input::get('new_password');

			// change password
			//
			$user->modifyPassword($newPassword);

			$cfg = array(
				'url' => Config::get('app.cors_url') ?: '',
				'user' => $user
			);

			Mail::send('emails.password-changed', $cfg, function($message) use ($user) {
				$message->to($user->email, $user->getFullName());
				$message->subject('SWAMP Password Changed');
			});

			return Response::json(array('success' => true));

		// current user is not an admin
		//
		} else if ($userUid == $currentUser->user_uid) {
			$oldPassword = Input::get('old_password');
			if (User::isValidPassword($oldPassword, $currentUser->password)) {
				$newPassword = Input::get('new_password');

				// change password
				//
				$currentUser->modifyPassword($newPassword);

				$cfg = array(
					'url' => Config::get('app.cors_url') ?: '',
					'user' => $user
				);

				Mail::send('emails.password-changed', $cfg, function($message) use ($user) {
					$message->to($user->email, $user->getFullName());
					$message->subject('SWAMP Password Changed');
				});

				return Response::json(array('success' => true));	
			} else {

				// old password is not valid
				//
				return Response::make('Old password is incorrect.', 404);
			}

		// current user is not the target user
		//
		} else {
			return Response::make("You must be an admin to change a user's password", 403);
		}
	}

	// update multiple
	//
	public function updateAll() {
		$input = Input::all();
		$collection = new Collection;
		for ($i = 0; $i < sizeOf($input); $i++) {
			UsersController::updateIndex( $item[$i]['user_uid'] );	
		}
		return $collection;
	}

	// delete by index
	//
	public function deleteIndex($userUid) {
		$user = User::getIndex($userUid);

		// call stored procedure to remove all project associations
		//
		$connection = DB::connection('mysql');
		$pdo = $connection->getPdo();
		$stmt = $pdo->prepare("CALL remove_user_from_all_projects(:userUuidIn, @returnString);");
		$stmt->bindParam(':userUuidIn', $userUuid, PDO::PARAM_STR, 45);
		$stmt->execute();

		$select = $pdo->query('SELECT @returnString;');
		$returnString = $select->fetchAll( PDO::FETCH_ASSOC )[0]['@returnString'];
		$select->nextRowset();

		/*
		// delete project memberships
		//
		ProjectMembership::deleteByUser($user);
		*/

		// modify user
		//
		$user->enabled_flag = false;
		$user->modify();

		// return response
		//
		return $user;
	}

	// get projects by id
	//
	public function getProjects($userUid) {
		$user = User::getIndex($userUid);
		$projects = null;
		$results = new Collection();
		if ($user != null) {
			$projects = $user->getProjects();
			foreach ($projects as $project) {
				if ($project != NULL && !$project->deactivation_date) {
					$results->push($project);
				}
			}
		}
		return $results;
	}

	// get memberships by id
	//
	public function getProjectMemberships($userUid) {
		return ProjectMembership::where('user_uid', '=', $userUid)->get();
	}

	//
	// private filtering utilities
	//

	private static function filterByAfterDate($items) {
		$after = Input::get('after');
		if ($after != NULL && $after != '') {
			$afterDate = new \DateTime($after);
			$afterDate->setTime(0, 0);
			/*
			$items = $items->filter(function($item) use ($afterDate) {
				if ($item->create_date != NULL) {
			    	return $item->create_date->getTimestamp() >= $afterDate->getTimestamp();
			    }
			});
			*/
			$filteredItems = new Collection();
			foreach ($items as $item) {
				if ($item->create_date != NULL) {
					$createDate = new \DateTime($item->create_date);
					if ($createDate->getTimestamp() >= $afterDate->getTimestamp()) {
						$filteredItems->push($item);
					}
				}
			}
			$items = $filteredItems;
		}
		return $items;
	}

	private static function filterByBeforeDate($items) {
		$before = Input::get('before');
		if ($before != NULL && $before != '') {
			$beforeDate = new \DateTime($before);
			$beforeDate->setTime(0, 0);
			/*
			$items = $items->filter(function($item) use ($beforeDate) {
				if ($item->create_date != NULL) {
			    	return $item->create_date->getTimestamp() <= $beforeDate->getTimestamp();
				}
			});
			*/
			$filteredItems = new Collection();
			foreach ($items as $item) {
				if ($item->create_date != NULL) {
					$createDate = new \DateTime($item->create_date);
					if ($createDate->getTimestamp() <= $beforeDate->getTimestamp()) {
						$filteredItems->push($item);
					}
				}
			}
			$items = $filteredItems;
		}
		return $items;
	}

	private static function filterByDate($items) {
		$items = self::filterByAfterDate($items);
		$items = self::filterByBeforeDate($items);
		return $items;
	}
}
