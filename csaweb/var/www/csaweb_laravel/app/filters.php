<?php

use Models\Users\User;
use Illuminate\Support\Facades\Input;
use Swamp\FiltersHelper;
use Models\Packages\Package;
use Models\Packages\PackageVersion;
use Models\Tools\Tool;
use Models\Tools\ToolVersion;
use Models\Platforms\Platform;
use Models\Platforms\PlatformVersion;

require(dirname(__FILE__) . "/HTMLPurifier/sanitize.php");

/*
|--------------------------------------------------------------------------
| Application & Route Filters
|--------------------------------------------------------------------------
|
| Below you will find the "before" and "after" events for the application
| which may be used to do any work before or after a request into your
| application. Here you may also register your custom route filters.
|
*/

App::before(function($request) {
	Session::set('salt', md5(uniqid(rand(), true)));
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		$headers = array(
			'Access-Control-Allow-Origin' => Config::get('app.cors_url'),
			'Access-Control-Allow-Methods' => 'POST, GET, OPTIONS, PUT, DELETE',
			'Access-Control-Allow-Headers' => 'X-Requested-With, content-type'
		);
		return Response::make('', 200, $headers);
	}

	// check session on non-whitelisted routes
	//
	if (!FiltersHelper::whitelisted()) {
		if (Session::has('timestamp') && ((time() - intval(Session::get('timestamp'))) > (60 * Config::get('session.timeout')))) {
			Session::flush();
			return Response::make('SESSION_INVALID', 401);
		} else if (Session::has('timestamp')) {
			Session::set('timestamp', time());
		} else {
			return Response::make('SESSION_INVALID', 401);
		}
	}
	
	// sanitize input
	//
	$impure      = false;
	$input       = Input::all();
	$bannedInput = array();
	$keys        = array_keys($input);
	for ($i = 0; $i < sizeof($keys); $i++) {
		
		// get input key value pair
		//
		$key   = $keys[$i];
		$value = $input[$key];
		
		// sanitize values
		//
		if (gettype($value) == 'string') {
			
			// use appropriate filtering method
			//
			if ($key != 'password') {
				$input[$key] = Sanitize::purify($value);
			} else {
				$input[$key] = str_ireplace("<script>", "", $input[$key]);
			}
			
			if ($input[$key] != $value) {
				$impure            = true;
				$bannedInput[$key] = $value;
			}
		}
	}
	
	if ($impure) {
		
		// report banned input
		//
		$userUid = Session::get('user_uid');
		syslog(LOG_WARNING, "User $userUid attempted to send unsanitary input containing HTML tags or script: " . json_encode($bannedInput));
		Input::replace($input);
		
		// return error
		//
		return Response::make("Can not send unsanitary input containing HTML tags or script.", 400);
	} else {
		
		// return sanitized input
		//
		Input::replace($input);
	}
});

App::after(function($request, $response) {
	$response->headers->set('Access-Control-Allow-Origin', Config::get('app.cors_url'));
	$response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	$response->headers->set('Access-Control-Allow-Headers', '*,x-requested-with,Content-Type,If-Modified-Since,If-None-Match,Auth-User-Token');
	$response->headers->set('Access-Control-Allow-Credentials', 'true');
	$response->headers->remove('Cache-Control');
	return $response;
});

/**
 * Validation of enabled users.
 */

Route::filter('user_enabled_check', function($route, $request) {
	$user_uid = Session::get('user_uid');
	if ($user_uid) {
		$user = User::getIndex($user_uid);
		if ($user && !$user->isEnabled()) {
			Session::flush();
			return Response::make('SESSION_INVALID', 401);
		}
	}
});

Route::when('*', 'user_enabled_check');

/**
  * Validation of user routes.
  */
Route::filter('filter_users', function( $route, $request ){
	switch( FiltersHelper::method() ){
		case 'get':
			if ($request->segment(2) != 'current') {
				return Response::make('Unable to access user.  Insufficient privilages.', 401);
			}
		break;
	}
});
Route::when('users*', 'filter_users');

/**
 * Validation of package routes.
 */

Route::filter('filter_packages', function($route, $request) {
	$method = FiltersHelper::method();
	switch ($method) {
		case 'post':
			$user = User::getIndex(Session::get('user_uid'));
			if (!$user) {
				return Response::make('The request requires user authentication.', 401);
			}
			break;
		case 'get':
		case 'put':
		case 'delete':

			// check package routes
			//
			$packageUuid = $route->getParameter('package_uuid');
			$isPackageVersionRoute = ($request->segment(3) == 'versions') || ($request->segment(4) == 'versions');
			if ($packageUuid && $packageUuid != 'all' && !$isPackageVersionRoute) {

				// get relevant attributes
				//
				$user = User::getIndex(Session::get('user_uid'));
				$package = Package::where('package_uuid', '=', $packageUuid)->first();
				$authenticationRequired = $method != 'get' && !$package->isPublic();
				
				// check to see if user is logged in
				//
				if ($authenticationRequired && !$user) {
					return Response::make('Authentication required to access package.', 401);
				} else {

					// check to see if user has priveleges to view package
					//
					if ($package && !$package->isPublic()) {
						if (!$user->isAdmin() && !$package->isAvailableTo($user)) {
							return Response::make('Insufficient priveleges to access package.', 403);
						}
					}
				}
			}

			// check package version routes
			//
			$packageVersionUuid = $route->getParameter('package_version_uuid');
			if ($packageVersionUuid) {

				// get relevant attributes
				//
				$user = User::getIndex(Session::get('user_uid'));
				$packageVersion = PackageVersion::where('package_version_uuid', '=', $packageVersionUuid)->first();
				$isPublic = $packageVersion->version_sharing_status == 'public' || $packageVersion->version_sharing_status == 'PUBLIC';
				$authenticationRequired = $method != 'get' && !$isPublic;

				// check to see if user is logged in
				//
				if ($authenticationRequired && !$user) {
					return Response::make('Authentication required to access package version.', 401);
				} else {

					// check to see if user has priveleges to view package version
					//
					if (!$isPublic) {
						if (!($user->isAdmin() || $packageVersion->getPackage()->isAvailableTo($user))) {
							return Response::make('Insufficient priveleges to access package version.', 403);
						}
					}
				}
			}

			break;
	}
});

/**
 * Validation of project routes.
 */

Route::filter('filter_projects', function($route, $request) {
	switch (FiltersHelper::method()) {
		case 'post':
			$user = User::getIndex(Session::get('user_uid'));
			if (!$user) {
				return Response::make('The request requires user authentication.', 401);
			}
			break;
		case 'get':
			$user = User::getIndex(Session::get('user_uid'));
			$projectUuid = $route->getParameter('project_uuid');
			if (!strpos($projectUuid, '+')) {

				// check a single project
				//
				if ($projectUuid && ((!$user) || ((!$user->isAdmin()) && (!$user->isProjectMember($projectUuid))))) {
					return Response::make('Insufficient privilages.', 401);
				}
			} else {

				// check multiple projects
				//
				$projectUuids = explode('+', $projectUuid);
				for ($i = 1; $i < sizeof($projectUuids); $i++) {
					$projectUuid = $projectUuids[$i];
					if ($projectUuid && ((!$user) || ((!$user->isAdmin()) && (!$user->isProjectMember($projectUuid))))) {
						return Response::make('Insufficient privilages.', 401);
					}
				}
			}
			break;
		case 'put':
		case 'delete':
			$user = User::getIndex(Session::get('user_uid'));
			if ($route->getParameter('project_uuid') && ((!$user) || ((!$user->isAdmin()) && (!$user->isProjectAdmin($route->getParameter('project_uuid')))))) {
				return Response::make('Insufficient privilages.', 401);
			}
			break;
	}
});
Route::when('projects*', 'filter_projects');

/**
 * Validation of tool routes.
 */

Route::filter('filter_tools', function($route, $request) {
	$method = FiltersHelper::method();
	switch ($method) {
		case 'get':
		case 'post':
		case 'put':
		case 'delete':

			// check tool routes
			//
			$toolUuid = $route->getParameter('tool_uuid');
			$isToolVersionRoute = ($request->segment(3) == 'versions') || ($request->segment(4) == 'versions');
			if ($toolUuid && !$isToolVersionRoute) {

				// get relevant attributes
				//
				$user = User::getIndex(Session::get('user_uid'));
				$tool = Tool::where('tool_uuid', '=', $toolUuid)->first();
				$isPublic = $tool->tool_sharing_status == 'public' || $tool->tool_sharing_status == 'PUBLIC';
				$authenticationRequired = $method != 'get' && !$isPublic;
				
				// check to see if user is logged in
				//
				if ($authenticationRequired && !$user) {
					return Response::make('Authentication required to access tool.', 401);
				} else {

					// check to see if user has priveleges to view tool
					//
					if (!$isPublic) {
						if (!($user->isAdmin() || $tool->isOwnedBy($user))) {
							return Response::make('Insufficient priveleges to access tool.', 403);
						}
					}
				}
			}

			// check tool version routes
			//
			$toolVersionUuid = $route->getParameter('tool_version_uuid');
			if ($toolVersionUuid) {

				// get relevant attributes
				//
				$user = User::getIndex(Session::get('user_uid'));
				$toolVersion = ToolVersion::where('tool_version_uuid', '=', $toolVersionUuid)->first();
				$tool = Tool::where('tool_uuid', '=', $toolVersion->tool_uuid)->first();
				$isPublic = $tool->tool_sharing_status == 'public' || $tool->tool_sharing_status == 'PUBLIC';
				$authenticationRequired = $method != 'get' && !$isPublic;

				// check to see if user is logged in
				//
				if ($authenticationRequired && !$user) {
					return Response::make('Authentication required to access tool version.', 401);
				} else {

					// check to see if user has priveleges to view tool version
					//
					if (!$isPublic) {
						if (!($user->isAdmin() || $toolVersion->getTool()->isOwnedBy($user))) {
							return Response::make('Insufficient priveleges to access tool version.', 403);
						}
					}
				}
			}

			break;
	}
});

/*
|--------------------------------------------------------------------------
| Authentication Filters
|--------------------------------------------------------------------------
|
| The following filters are used to verify that the user of the current
| session is logged into this application. The "basic" filter easily
| integrates HTTP Basic authentication for quick, simple checking.
|
*/

Route::filter('auth', function() {
	if (Auth::guest())
		return Redirect::guest('login');
});


Route::filter('auth.basic', function() {
	return Auth::basic();
});

/*
|--------------------------------------------------------------------------
| Guest Filter
|--------------------------------------------------------------------------
|
| The "guest" filter is the counterpart of the authentication filters as
| it simply checks that the current user is not logged in. A redirect
| response will be issued if they are, which you may freely change.
|
*/

Route::filter('guest', function() {
	if (Auth::check())
		return Redirect::to('/');
});

/*
|--------------------------------------------------------------------------
| CSRF Protection Filter
|--------------------------------------------------------------------------
|
| The CSRF filter is responsible for protecting your application against
| cross-site request forgery attacks. If this special token in a user
| session does not match the one given in this request, we'll bail.
|
*/

Route::filter('csrf', function() {
	if (Session::token() != Input::get('_token')) {
		throw new Illuminate\Session\TokenMismatchException;
	}
});
