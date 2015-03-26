<?php

namespace Controllers\Admin;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Mail;
use Models\Users\UserAccount;
use Models\Users\User;
use Controllers\BaseController;

class AdminsController extends BaseController {

	// create
	//
	public function postCreate($userUid) {
		$userAccount = UserAccount::where('user_uid', '=', $userUid)->first();
		$userAccount->admin_flag = 1;
		$userAccount->save();
		return $userAccount;
	}

	// get by index
	//
	public function getIndex($userUid) {
		$userAccount = UserAccount::where('user_uid', '=', $userUid)->first();
		if ($userAccount->admin_flag == 1) {
			return $userAccount;
		} else {
			return Response::make('User is not an administrator.', 401);
		}
	}

	// get all
	//
	public function getAll() {
		$admins = UserAccount::where('admin_flag', '=', 1)->get();
		$users = new Collection;
		foreach( $admins as $admin ) {
			$user = User::getIndex($admin->user_uid);
			if( $user ) {
				$users[] = $user;
			}
		}
		return $users;
	}

	// update by index
	//
	public function updateIndex($userUid) {
		$userAccount = UserAccount::where('user_uid', '=', $userUid)->first();
		$userAccount->admin_flag = 0;
		$userAccount->save();
		return $userAccount;
	}

	// delete by index
	//
	public function deleteIndex($userUid) {
		$userAccount = UserAccount::where('user_uid', '=', $userUid)->first();
		$userAccount->admin_flag = 0;
		$userAccount->save();
		return $userAccount;
	}

	public function sendEmail(){

		if( ! Input::has('subject') ){
			return Response::make('Missing subject field.', 500);
		} elseif( ! Input::has('body') ){
			return Response::make('Missing body field.', 500);
		} elseif( ! Input::has('recipients') ){
			return Response::make('Missing recipients field.', 500);
		}

		$this->subject = Input::get('subject');
		$body = Input::get('body');

		if( ( $this->subject == '' ) || ( $body == '' ) ){
			return Response::make('The email subject and body fields must not be empty.', 500);
		}

		$recipients = Input::get('recipients');
		if( sizeof( $recipients ) < 1 ){
			return Response::make('The email must have at least one recipient.', 500);	
		}

		$failures = new Collection();

		foreach( $recipients as $email ){

			$user = User::getByEmail($email);

			if( ! $user ){
				return Response::make("Could not load user: $email", 500);	
			}

			$data = array(
				'user' => $user,
				'body' => $body
			);

			$this->secure = false;
			if( ( strpos( $body, 'END PGP SIGNATURE' ) != FALSE ) || ( strpos( $body, 'END GPG SIGNATURE' ) != FALSE ) ){
				$this->secure = true;
			}

			if( $user && filter_var( $user->email, FILTER_VALIDATE_EMAIL ) && ( trim( $user->email ) != '' ) && ( trim( $user->getFullName() ) != '' ) ){
				Mail::send(array('text' => 'emails.admin'), $data, function($message) use ( $user ){
					$message->to($user->email, $user->getFullName());
					$message->subject($this->subject);
					if( $this->secure ){
						$message->from('security@continuousassurance.org');
					}
				});
			} else {
					$failures->push(array( 'user' => $user->toArray(), 'email' => $email ));
			}

		}

		return $failures;

	}

}
