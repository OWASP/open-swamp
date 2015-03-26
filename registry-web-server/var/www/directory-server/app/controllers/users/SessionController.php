<?php

namespace Controllers\Users;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Models\Users\User;
use Models\Users\UserAccount;
use Models\Users\LinkedAccount;
use Models\Users\LinkedAccountProvider;
use Models\Users\UserEvent;
use Models\Users\EmailVerification;
use Models\Utilities\GUID;
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
				if ($user->hasBeenVerified()) {
					if ($user->isEnabled()) {
						$userAccount = $user->getUserAccount();
						$userAccount->penultimate_login_date = $userAccount->ultimate_login_date;
						$userAccount->ultimate_login_date = gmdate('Y-m-d H:i:s');
						$userAccount->save();
						$res = Response::json(array('user_uid' => $user->user_uid));
						Session::set('timestamp', time());
						Session::set('user_uid', $user->user_uid);
						return $res;
					} else
						return Response::make('User has not been approved.', 401);
				} else
					return Response::make('User email has not been verified.', 401);
			} else
				return Response::make('Incorrect username or password.', 401);
		} else
			return Response::make('Incorrect username or password.', 401);

		/*
		$credentials = array(
			'username' => $username,
			'password' => $password
		);

		if (Auth::attempt($credentials)) {
			return Response::json(array(
				'user_uid' => $user->uid
			));
		} else
			return Response::error('500');
		*/
	}

	// final logout of user
	//
	public function postLogout() {

		// update last url visited
		//
		//$this->postUpdate();

		// destroy session cookies
		//
		Session::flush();
		return Response::make('SESSION_DESTROYED');

		//Auth::logout();
	}

	// GitHub OAuth Callbacks
	//
	public function github(){
		$ch = curl_init('https://github.com/login/oauth/access_token');
		curl_setopt($ch, CURLOPT_POSTFIELDS, array(
			'client_id' =>  Config::get('github.client_id'),
			'client_secret' => Config::get('github.client_secret'),
			'code' => Input::get('code')
		));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
		curl_setopt($ch, CURLOPT_USERAGENT, 'SWAMP');
		$response = curl_exec($ch);

		$status = array();
		parse_str( $response, $status );

		// a GitHub access_token has been granted
		//
		if( array_key_exists('access_token', $status ) ){

			Session::set('github_access_token', $status["access_token"]);
			Session::set('github_access_time', gmdate('U'));


			// Load user
			//
			$ch = curl_init('https://api.github.com/user');
			curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Authorization: token $status[access_token]" ));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
			curl_setopt($ch, CURLOPT_USERAGENT, 'SWAMP');
			$response = curl_exec($ch);

			$github_user = json_decode( $response );


			$account = LinkedAccount::where('user_external_id', '=', $github_user->id)->where('linked_account_provider_code','=','github')->first();

			// linked account record exists for this github user
			//
			if( $account ){

				// a SWAMP user account for the github user exists
				//
				$user = User::getIndex($account->user_uid);

				if ($user) {
					// github linked account disabled?
					//
					if( LinkedAccountProvider::where('linked_account_provider_code','=','github')->first()->enabled_flag != '1' ){
						return Redirect::to( Config::get('app.cors_url') . '/#github/error/github-auth-disabled' );
					}
					// github authentication disabled?
					//
					if( $account->enabled_flag != '1' ){
						return Redirect::to( Config::get('app.cors_url') . '/#github/error/github-account-disabled' );
					}
					// continue checking basic user credentials
					//
					if ($user->hasBeenVerified()) {
						if ($user->isEnabled()) {
							return Redirect::to( Config::get('app.cors_url') . '/#github/login' );
						} else
							return Redirect::to( Config::get('app.cors_url') . '/#github/error/not-enabled' );
					} else
						return Redirect::to( Config::get('app.cors_url') . '/#github/error/not-verified' );
				} else {

					// SWAMP user not found for existing linked account.
					//
					LinkedAccount::where('user_external_id','=',$github_user->id)->where('linked_account_provider_code','=','github')->delete();

					return Redirect::to( Config::get('app.cors_url') . "/#github/prompt" );

				}
			} else {

				return Redirect::to( Config::get('app.cors_url') . "/#github/prompt" );

			}

		// a GitHub access_token has not been granted
		//
		} else {
			return Response::make('Unable to authenticate with GitHub.', 401);
		}
	}

	// retrieves and returns information about the currently logged in github user
	public function githubUser(){

		if( ! Session::has('github_access_token') )
			return Response::make('Unauthorized GitHub access.', 401);

		$token = Session::get('github_access_token');

		$ch = curl_init('https://api.github.com/user');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Authorization: token $token" ));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_USERAGENT, 'SWAMP');
		$response = curl_exec($ch);

		$github_user = json_decode( $response, true );
		$github_user['email'] = array_key_exists( 'email', $github_user ) ? $github_user['email'] : '';

		$user = array(
			'user_external_id' 	=> $github_user['id'],
			'username' 			=> $github_user['login'],
			'email'    			=> $github_user['email']
		);

		return $user;
	}

	public function registerGithubUser(){

		if( ! Session::has('github_access_token') )
			return Response::make('Unauthorized GitHub access.', 401);

		$token = Session::get('github_access_token');

		$ch = curl_init('https://api.github.com/user');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Authorization: token $token" ));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_USERAGENT, 'SWAMP');
		$response = curl_exec($ch);

		$github_user = json_decode( $response, true );

		// Append email information
		//
		$ch = curl_init('https://api.github.com/user/emails');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Authorization: token $token" ));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_USERAGENT, 'SWAMP');
		$response = curl_exec($ch);

		$github_emails = json_decode( $response );

		$github_user['email'] = '';
		$primary_verified = false;
		foreach( $github_emails as $email ){
			if( ( $email->primary == '1' ) && ( $email->verified == '1' ) ){
				$primary_verified = true;
				$github_user['email'] = $email->email;
			}
			else if( $email->primary == '1' ){
				$github_user['email'] = $email->email;
			}
		}


		$names = array_key_exists('name', $github_user) ? explode(' ', $github_user['name']) : array('','');

		$user = new User(array(
			'first_name' => array_key_exists( 0, $names ) ? $names[0] : '',
			'last_name' => array_key_exists( 1, $names ) ? $names[1] : '',
			'preferred_name' => array_key_exists( 'name', $github_user ) ? $github_user['name'] : '',
			'username' => $github_user['login'],
			'password' => md5(uniqid()).strtoupper(md5(uniqid())),
			'user_uid' => GUID::create(),
			'email' => $github_user['email'],
			'address' => array_key_exists( 'location', $github_user ) ? $github_user['location'] : ''
		));

		// Attempt username permutations
		//
		for($i = 1; $i < 21; $i++){
			$errors = array();
			if( $user->isValid($errors, true) ) break;
			if( $i == 20 ) return Response::make('Unable to generate SWAMP GitHub user:<br/><br/>'.implode( '<br/>', $errors ), 401);
			$user->username = $github_user['login'].$i;
		}

		$user->add();

		$linkedAccount = new LinkedAccount(array(
			'user_uid' => $user->user_uid,
			'user_external_id' => $github_user['id'],
			'linked_account_provider_code' => 'github',
			'enabled_flag' => 1
		));
		$linkedAccount->save();

		if( $primary_verified ){

			// Mark user account email verified flag
			$userAccount = $user->getUserAccount();
			$userAccount->email_verified_flag = 1;
			$userAccount->save();

			Mail::send('emails.welcome', array(
				'user'		=> $user,
				'logo'		=> Config::get('app.cors_url') . '/images/logos/swamp-logo-small.png',
				'manual'	=> Config::get('app.cors_url') . '/documentation/SWAMP-UserManual.pdf',
			), function($message) use ($user) {
				$message->to($user->email, $user->getFullName());
				$message->subject('Welcome to the Software Assurance Marketplace');
			});

			return Response::json(array(
				'primary_verified' => true,
				'user' => $user
			));
		} else {
			$emailVerification = new EmailVerification(array(
				'user_uid' => $user->user_uid,
				'verification_key' => GUID::create(),
				'email' => $user->email
			));
			$emailVerification->save();
			$emailVerification->send('#register/verify-email');

			return Response::json(array(
				'primary_verified' => false,
				'user' => $user
			));
		}
	}

	public function githubRedirect(){
		$path = '/github';
		$redirectUri = urlencode(Config::get('app.url').$path);
		$gitHubClientId = Config::get('github.client_id');
		return Redirect::to('https://github.com/login/oauth/authorize?redirect_uri=' . $redirectUri . '&client_id=' . $gitHubClientId . '&scope=user:email');
	}

	public function githubLink(){

		$username = Input::get('username');
		$password = Input::get('password');

		$user = User::getByUsername($username);
		if ($user) {
			if (User::isValidPassword($password, $user->password)) {
				if ($user->hasBeenVerified()) {
					if ($user->isEnabled()) {

						// Attempt to load the github account the user is currently logged in as.
						//
						if( ( ! Session::has('github_access_token') ) || ( ! Session::has('github_access_time') ) )
							return Response::make('Unauthorized GitHub access.', 401);

						if( gmdate('U') - Session::get('github_access_time') > ( 15 * 60 ) )
							return Response::make('GitHub access has expired.  If you would like to link a GitHub account to an existing SWAMP account, please click "Sign In" and select "Sign in With GitHub."', 401);

						$token = Session::get('github_access_token');

						$ch = curl_init('https://api.github.com/user');
						curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Authorization: token $token" ));
						curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
						curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
						curl_setopt($ch, CURLOPT_USERAGENT, 'SWAMP');
						$response = curl_exec($ch);

						$github_user = json_decode( $response );

						if( ! property_exists( $github_user, 'id' ) )
							return Response::make('Unable to authenticate with GitHub.', 401);

						// Make sure they don't already have an account
						//
						$account = LinkedAccount::where('user_uid','=',$user->user_uid)->where('linked_account_provider_code','=','github')->first();
						if( $account && ! ( Input::has('confirmed') && Input::get('confirmed') === 'true' ) ){
							return Response::json(array(
								'error' => 'EXISTING_ACCOUNT',
								'username' => $user->username,
								'login' => $github_user->login
							), 401);
						}

						// Verify they are logged in as the account they are attempting to link to.
						//
						if( $github_user->id != Input::get('github_id') )
							return Response::make('Unauthorized GitHub access.', 401);

						// Remove any old entries
						LinkedAccount::where('user_uid','=',$user->user_uid)->where('linked_account_provider_code','=','github')->delete();

						// Link the accounts
						//
						$linkedAccount = new LinkedAccount(array(
							'linked_account_provider_code' => 'github',
							'user_external_id' => Input::get('github_id'),
							'enabled_flag' => 1,
							'user_uid' => $user->user_uid,
							'create_date' => gmdate('Y-m-d H:i:s')
						));
						$linkedAccount->save();
						$userEvent = new UserEvent(array(
							'user_uid' => $user->user_uid,
							'event_type' => 'linkedAccountCreated',
							'value' => json_encode(array(
								'linked_account_provider_code' 	=> 'github',
								'user_external_id' 				=> $linkedAccount->user_external_id,
								'user_ip' 						=> $_SERVER['REMOTE_ADDR']
							))
						));
						$userEvent->save();
						Response::make('User account linked!');
					} else
						return Response::make('User has not been approved.', 401);
				} else
					return Response::make('User email has not been verified.', 401);
			} else
				return Response::make('Incorrect username or password.', 401);
		} else
			return Response::make('Incorrect username or password.', 401);

	}

	public function githubLogin(){

		// Attempt to load the github account the user is currently logged in as.
		//
		if( ! Session::has('github_access_token') )
			return Response::make('Unauthorized GitHub access.', 401);

		$token = Session::get('github_access_token');

		$ch = curl_init('https://api.github.com/user');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array( "Authorization: token $token" ));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_USERAGENT, 'SWAMP');
		$response = curl_exec($ch);

		$github_user = json_decode( $response );

		if( ! property_exists( $github_user, 'id' ) )
			return Response::make('Unable to authenticate with GitHub.', 401);

		$account = LinkedAccount::where('user_external_id', '=', $github_user->id)->first();
		if( $account ){
			$user = User::getIndex($account->user_uid);
			if ($user) {
				if ($user->hasBeenVerified()) {
					if ($user->isEnabled()) {
						$userAccount = $user->getUserAccount();
						$userAccount->penultimate_login_date = $userAccount->ultimate_login_date;
						$userAccount->ultimate_login_date = gmdate('Y-m-d H:i:s');
						$userAccount->save();

						$userEvent = new UserEvent(array(
							'user_uid' 		=> $user->user_uid,
							'event_type' 	=> 'linkedAccountSignIn',
							'value' => json_encode(array(
								'linked_account_provider_code' 	=> 'github',
								'user_external_id' 				=> $account->user_external_id,
								'user_ip' 						=> $_SERVER['REMOTE_ADDR']
							))
						));
						$userEvent->save();

						$res = Response::json(array(
							'user_uid' => $user->user_uid,
							'access_token' => $token
						));

						Session::set('timestamp', time());
						Session::set('user_uid', $user->user_uid);
						return $res;
					} else
						return Response::make('User has not been approved.', 401);
				} else
					return Response::make('User email has not been verified.', 401);
			} else
				return Response::make('Incorrect username or password.', 401);
		} else {
			return Response::make('Account not found.', 401);
		}
	}

}
