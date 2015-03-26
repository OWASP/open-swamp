<?php

namespace Swamp;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Request;

use Models\Users\User;

/*
|--------------------------------------------------------------------------
| Filter Functions
|--------------------------------------------------------------------------
|
| Below you will find a set of utility functions used to protect access to
| routes on the SWAMP registry server.
|
*/

class FiltersHelper {

	static function method(){
		return strtolower( $_SERVER['REQUEST_METHOD'] );
	}

	static function whitelisted(){

		// Detect API Request
		//
		if( Input::get('api_key') && Input::get('user_uid') ){
			if( Config::get('app.api_key') == Input::get('api_key') ){
				if( ! User::getIndex(Input::get('user_uid')) ){
					return false;
				}
				Session::set('user_uid', Input::get('user_uid'));
				return true;
			}
			return false;
		}

		// Detect Whitelisted Route
		//
		foreach( Config::get('app.whitelist') as $pattern ){
			if( is_array( $pattern ) ){
				if( Request::is( key( $pattern ) ) ){
					return in_array( self::method(), current( $pattern ) );
				}
			} else {
				if( Request::is($pattern) ){ 
					return true;
				}
			}
		}
		return false;
	}

	static function filterPassword($string) {
		return str_ireplace("<script>", "", $string);
	}
}
