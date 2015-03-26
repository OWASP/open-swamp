<?php

namespace Controllers\Users;

use PDO;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Models\Users\User;
use Models\Users\UserAccount;
use Models\Users\UserPermission;
use Models\Users\LinkedAccount;
use Models\Users\Permission;
use Models\Users\UserEvent;
use Models\Utilities\GUID;
use Controllers\BaseController;

class LinkedAccountsController extends BaseController {

	public function getLinkedAccountsByUser($userUid) {
		$active_user = User::getIndex(Session::get('user_uid'));
		if( $userUid == Session::get('user_uid') || $active_user->isAdmin() )
			return LinkedAccount::where('user_uid', '=', $userUid)->get();
		return Response::make('User not allowed to retrieve linked accounts.', 401);
	}

	public function deleteLinkedAccount( $linkedAccountId ){
		$active_user 	= User::getIndex(Session::get('user_uid'));
		$account 		= LinkedAccount::where('linked_account_id', '=', $linkedAccountId)->first();
		$user 			= User::getIndex($account->user_uid);
		if( ( $user->user_uid == $active_user->user_uid ) || $active_user->isAdmin() ){
			$userEvent = new UserEvent(array(
				'user_uid' => $user->user_uid,
				'event_type' => 'linkedAccountDeleted',
				'value' => json_encode(array( 
					'linked_account_provider_code' 	=> 'github', 
					'user_external_id' 				=> $account->user_external_id, 
					'user_ip' 						=> $_SERVER['REMOTE_ADDR']
				))
			));
			$userEvent->save();
			$account->delete();
			return Response::make('The linked account has been deleted.', 204);
		} else {
			return Response::make('Unable to delete this linked account.  Insufficient privileges.', 500);
		}
	}

	public function setEnabledFlag( $linkedAccountId ){
		$value 			= Input::get('enabled_flag');
		$active_user 	= User::getIndex(Session::get('user_uid'));
		$account 		= LinkedAccount::where('linked_account_id', '=', $linkedAccountId)->first();
		$user 			= User::getIndex($account->user_uid);
		if( ( $user->user_uid == $active_user->user_uid ) || $active_user->isAdmin() ){
			$account->enabled_flag = $value ? 1 : 0;
			$account->save();
			$userEvent = new UserEvent(array(
				'user_uid' => $user->user_uid,
				'event_type' => 'linkedAccountToggled',
				'value' => json_encode(array( 
					'linked_account_provider_code' 	=> 'github', 
					'user_external_id' 				=> $account->user_external_id, 
					'user_ip' 						=> $_SERVER['REMOTE_ADDR'],
					'enabled'						=> $account->enabled_flag
				))
			));
			$userEvent->save();
			return Response::make('The status of this linked account has been updated.');
		} else {
			return Response::make('Unable to update this linked account.  Insufficient privileges.', 500);
		}
	}
}
