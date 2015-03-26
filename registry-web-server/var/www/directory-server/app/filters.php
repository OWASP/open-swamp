<?php

use Models\Users\User;
use Models\Users\PasswordReset;
use Models\Projects\Project;
use Illuminate\Support\Facades\Input;

use \DateTime;
use \DateTimeZone;

use Swamp\FiltersHelper;
use Swamp\Sanitize;


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
	if (FiltersHelper::method() == 'options') {
		$headers = array(
			'Access-Control-Allow-Origin'  => Config::get('app.cors_url'),
			'Access-Control-Allow-Methods' => 'POST, GET, OPTIONS, PUT, DELETE',
			'Access-Control-Allow-Headers' => 'X-Requested-With, content-type'
		);
		return Response::make('', 200, $headers);
	}

	if (!FiltersHelper::whitelisted() && ($request->segment(2) != 'current')) {
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
	$impure = false;
	$input = Input::all();
	$bannedInput = array();
	$keys = array_keys($input);
	for ($i = 0; $i < sizeof($keys); $i++) {

		// get input key value pair
		//
		$key = $keys[$i];
		$value = $input[$key];

		// sanitize values
		//
		if (gettype($value) == 'string') {

			// use appropriate filtering method
			//
			if ($key != 'password' && $key != 'new_password' && $key != 'old_password') {
				$input[$key] = Sanitize::purify($value);
			} else {
				$input[$key] = str_ireplace("<script>", "", $input[$key]);
			}

			if ($input[$key] != $value) {
				$impure = true;
				$bannedInput[$key] = $value;
			}
		}
	}

	if ($impure) {

		// report banned input
		//
		$userUid = Session::get('user_uid');
		syslog(LOG_WARNING, "User $userUid attempted to send unsanitary input containing HTML tags or script: ".json_encode($bannedInput));
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

App::after(function($request, $response){
    $response->headers->set('Access-Control-Allow-Origin', Config::get('app.cors_url'));
    $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    $response->headers->set('Access-Control-Allow-Headers', 'x-requested-with,Content-Type,If-Modified-Since,If-None-Match,Auth-User-Token');
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
Route::filter('filter_users', function($route, $request) {
	switch (FiltersHelper::method()) {
		case 'get':
			$user = User::getIndex(Session::get('user_uid'));
			if ($request->segment(2) != 'project_ownership_policy') {
				if ((!$user) || ((!$user->isAdmin()) &&
					(($request->segment(2) != 'current') && sizeof($request->segments()) == 2) &&
					($route->getParameter('user_uid') != $user->user_uid))) {
					return Response::make('Unable to access user.  Insufficient privilages.', 401);
				}
				if (!$user->isAdmin() && $route->getParameter('user_uid') &&
					($route->getParameter('user_uid') != 'current') &&
					($route->getParameter('user_uid') != $user->user_uid)) {
					return Response::make('Unable to access user.  Insufficient privilages.', 401);
				}
			}
		case 'post':
			break;
		case 'put':
		case 'delete':
			$user = User::getIndex(Session::get('user_uid'));
			if ((!$user) ||
				((!$user->isAdmin()) && ($user->user_uid != $route->getParameter('user_uid')))) {
				return Response::make('Unable to modify or delete user.  Insufficient privilages.', 401);
			}
			break;
	}
});
Route::when('users*', 'filter_users');

/**
  * Validation of password routes.
  */
Route::filter('filter_password', function($route, $request) {
	switch (FiltersHelper::method()) {
		case 'get':
			break;

		case 'post':
			break;

		case 'delete':
			break;

		case 'put':
			$user = User::getIndex(Session::get('user_uid'));
			if (!$user) {

				// not logged in
				//
				if ((!$request->has('password_reset_key')) || (!$request->has('password_reset_id'))) {
					return Response::make('Unable to modify user.', 401);
				}

				// check for password reset
				//
				$passwordReset = PasswordReset::where('password_reset_id', '=', $request->input('password_reset_id'))->first();
				if (!$passwordReset || !Hash::check($request->input('password_reset_key'), $passwordReset->password_reset_key)) {
					return Response::make('Unable to modify user.', 401);
				}

				// check for password reset expiration
				//
				$time = new DateTime($passwordReset->create_date, new DateTimeZone('GMT'));
				if ((gmdate('U') - $time->getTimestamp() ) > 1800) {
					return Response::make('Password reset key expired.', 401);
				}
			} else {

				// logged in
				//
				if (!$request->has('user_uid')) {
					return Response::make('Unable to modify user.', 500);
				}
				if (!$user->isAdmin() && ($request->input('user_uid') != $user->user_uid)) {
					return Response::make('Unable to modify user.', 500);
				}
			}
			break;
	}
});
Route::when('password_resets*', 'filter_password');

/**
  * Validation of project routes.
  */
Route::filter('filter_projects', function($route, $request) {
	switch (FiltersHelper::method()) {
		case 'get':
			if (count($request->segments()) > 1 && ($request->segment(3) != 'confirm')) {
				$projectUid = $route->getParameter('project_uid');

				// check project access privilages
				//
				$user = User::getIndex(Session::get('user_uid'));
				if ((!$user) || ((!$user->isAdmin()) && (!$user->isProjectMember($projectUid)))) {
					return Response::make('Unable to access project.  Insufficient privilages.', 401);
				}

				// check to see if project is active
				//
				if (!$user->isAdmin()) {
					$project = Project::where('project_uid', '=', $projectUid)->first();
					if (!$project->isActive()) {
						return Response::make('Sorry - project has been deactivated.', 401);
					}
				}
			}
			break;

		case 'post':
			$user = User::getIndex(Session::get('user_uid'));
			if (!$user || !$user->isOwner()) {
				return Response::make('Must be logged in to create new projects.', 401);
			}
			break;

		case 'put':
		case 'delete':
			$user = User::getIndex(Session::get('user_uid'));
			$projectUuid = $route->getParameter('project_uid');
			if ($projectUuid && ((!$user) || ((!$user->isAdmin()) && (!$user->isProjectAdmin($projectUuid))))) {
				return Response::make('Insufficient privilages.', 401);
			}
			break;
	}
});
Route::when('projects*', 'filter_projects');

/**
  * Validation of project membership routes.
  */
Route::filter('filter_memberships', function( $route, $request ){
	switch (FiltersHelper::method()) {
		case 'get':
			break;

		case 'post':
			break;

		case 'put':
		case 'delete':

			// check to see that user is logged in
			//
			$user = User::getIndex(Session::get('user_uid'));
			if (!$user) {
				return Response::make('Unable to change project membership.  Insufficient privilages.', 401);
			}

			// check privileges
			//
			if ($route->getParameter('project_membership_id')) {
				if ((!$user->isAdmin()) && (!$user->isProjectAdmin($route->getParameter('project_membership_id'))) && (!$user->hasProjectMembership($route->getParameter('project_membership_id')))) {
					return Response::make('Unable to change project membership.  Insufficient privileges.', 401);
				}
			} else if ($route->getParameter('project_uid')) {
				if ((!$user->isAdmin()) && (!$user->isProjectAdmin($route->getParameter('project_uid')))) {
					return Response::make('Unable to change project membership.  Insufficient privileges.', 401);
				}
			}
			break;
	}
});
Route::when('memberships*', 'filter_memberships');

/**
  * Validation of admin routes.
  */
Route::filter('filter_admins', function( $route, $request ){
	switch( FiltersHelper::method() ){
		case 'get':
		case 'put':
		case 'delete':
			$user = User::getIndex(Session::get('user_uid'));
			if ((!$user) || (!$user->isAdmin())) {
				return Response::make('Unable to access route.  Current user is not an administrator.', 401);
			}
			break;
		case 'post':
			break;
	}
});
Route::when('admins*', 'filter_admins');
Route::when('restricted-domains*', 'filter_admins');

/**
  * Validation of admin routes.
  */
Route::filter('filter_admin_invitations', function( $route, $request ){
	switch( FiltersHelper::method() ){
		case 'put':
		case 'delete':
			break;

		case 'get':
			$user = User::getIndex(Session::get('user_uid'));
			if ((count($request->segments()) == 1) && ((!$user) || (!$user->isAdmin()))) {
				return Response::make('Unable to access route.  Current user is not an administrator.', 401);
			}
			break;

		case 'post':
			$user = User::getIndex(Session::get('user_uid'));
			if ((!$user) || (!$user->isAdmin())) {
				return Response::make('Unable to access route.  Current user is not an administrator.', 401);
			}
			break;
	}
});
Route::when('admin_invitations*', 'filter_admin_invitations');

/**
  * Validation of project routes.
  */
Route::filter('filter_project_invitations', function($route, $request) {
	switch (FiltersHelper::method()) {
		case 'get':
		case 'put':
		case 'delete':
			break;

		case 'post':
 			$user = User::getIndex(Session::get('user_uid'));
			if (!$user || !$request->input('project_uid')) {
				return Response::make('Unable to change project membership.  Insufficient privilages.', 401);
			}
			if ((!$user->isAdmin()) && (!$user->isProjectAdmin( $request->input('project_uid')))) {
				return Response::make('Unable to change project membership.  Insufficient privilages.', 401);
			}
			$project = Project::where('project_uid', '=', $request->input('project_uid'))->first();
			if ($project->trial_project_flag) {
				return Response::make('Unable to change project membership.  Insufficient privilages.', 401);
			}
		break;
	}
});
Route::when('invitations*', 'filter_project_invitations');

/**
  * Validation of restricted domain paths.
  */
Route::filter('filter_restricted_domains', function($route, $request) {
	switch (FiltersHelper::method()) {
		case 'post':
		case 'put':
		case 'delete':
			$user = User::getIndex(Session::get('user_uid'));
			if ((!$user) || (!$user->isAdmin())) {
				return Response::make('Unable to access route.  Current user is not an administrator.', 401);
			}
			break;

		case 'get':
			break;
	}
});
Route::when('restricted-domains*', 'filter_restricted_domains');

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

Route::filter('auth', function()
{
	if (Auth::guest()) return Redirect::guest('login');
});


Route::filter('auth.basic', function()
{
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

Route::filter('guest', function()
{
	if (Auth::check()) return Redirect::to('/');
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

Route::filter('csrf', function()
{
	if (Session::token() != Input::get('_token'))
	{
		throw new Illuminate\Session\TokenMismatchException;
	}
});