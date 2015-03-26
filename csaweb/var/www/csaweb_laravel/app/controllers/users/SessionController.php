<?php

namespace Controllers\Users;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Config;
use Models\Users\User;
use Models\Users\UserAccount;
use Models\Users\LinkedAccount;
use Controllers\BaseController;

class SessionController extends BaseController {

	// initial login of user
	//
	public function postLogin() {

		// get input parameters
		//
		$username = Input::get('username');
		$password = Input::get('password');

		// validate user
		//
		$user = User::getByUsername($username);
		if ($user) {
			if (User::isValidPassword($password, $user->password)) {
				if ($user->isEnabled()) {
					$res = Response::json(array('user_uid' => $user->user_uid));
					Session::set('timestamp', time());
					Session::set('user_uid', $user->user_uid);
					return $res;
				} else {
					return Response::make('User has not been approved.', 401);
				}
			} else {
				return Response::make('Incorrect username or password.', 401);
			}
		} else {
			return Response::make('Incorrect username or password.', 401);
		}
	}

	// final logout of user
	//
	public function postLogout() {
		Session::flush();
		return Response::make('SESSION_DESTROYED');
	}

	public function githubLogin(){
		$access_token = Input::get('access_token');

		$ch = curl_init('https://api.github.com/user');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Authorization: token $access_token" ));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_USERAGENT, 'SWAMP');
		$response = curl_exec($ch);
		$user = json_decode( $response );

		$account = LinkedAccount::where('user_external_id', '=', $user->id)->first();
		if( $account ){

			Session::set('github_access_token', $access_token);

			$user = User::getIndex($account->user_uid);
			if ($user) {
				if ($user->isEnabled()) {
					$res = Response::json(array('user_uid' => $user->user_uid));
					Session::set('timestamp', time());
					Session::set('user_uid', $user->user_uid);
					return $res;
				} else
					return Response::make('User has not been approved.', 401);
			} else
				return Response::make('Incorrect username or password.', 401);
		} else {
			return Response::make('Account not found.', 401);
		}
	}

}
