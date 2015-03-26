<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Models\CreateStamped;
use Models\Users\User;

class UserPermission extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'user_permission_uid';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid',
		'user_permission_uid',
		'permission_code',
		'user_comment',
		'admin_comment',
		'request_date',
		'grant_date',
		'denial_date',
		'expiration_date',
		'delete_date',
		'meta_information'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'user_uid',
		'permission_code',
		'user_comment',
		'admin_comment',
		'request_date',
		'grant_date',
		'expiration_date',
		'delete_date',
		'meta_information',
		'status'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'status'
	);

	public function getStatusAttribute(){
		return $this->getStatus();
	}

	public function getStatus(){
		if( $this->denial_date && ( gmdate('Y-m-d H:i:s') > $this->denial_date ) ){
			return 'denied';
		}
		else if( $this->expiration_date && ( gmdate('Y-m-d H:i:s') > $this->expiration_date ) ){
			return 'expired';
		}
		else if( $this->delete_date && ( gmdate('Y-m-d H:i:s') > $this->delete_date ) ){
			return 'revoked';
		}
		else if( $this->grant_date && ( gmdate('Y-m-d H:i:s') > $this->grant_date ) ){
			return 'granted';
		}
		else {
			return 'pending';
		}
	}
}
