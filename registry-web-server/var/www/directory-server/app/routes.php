<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

/*
Route::get('/', function() {
        return View::make('hello');
});
*/

Route::get('/', function() {
	return View::make('swamphome');
});

Route::get('environment', function() {
	return App::environment();
});

// login routes
//
Route::post('login', 'Controllers\Users\SessionController@postLogin');
Route::post('logout', 'Controllers\Users\SessionController@postLogout');

// linked account routes
//
Route::get('linked-accounts/user/{user_uid}', 'Controllers\Users\LinkedAccountsController@getLinkedAccountsByUser');
Route::post('linked-accounts/{linked_account_id}/enabled', 'Controllers\Users\LinkedAccountsController@setEnabledFlag');
Route::delete('linked-accounts/{linked_account_id}', 'Controllers\Users\LinkedAccountsController@deleteLinkedAccount');

// github session integration
//
Route::get('github','Controllers\Users\SessionController@github');
Route::get('github/user','Controllers\Users\SessionController@githubUser');
Route::get('github/register','Controllers\Users\SessionController@registerGithubUser');
Route::get('github/redirect','Controllers\Users\SessionController@githubRedirect');
Route::post('github/link','Controllers\Users\SessionController@githubLink');
Route::delete('github/link','Controllers\Users\SessionController@githubUnlink');
Route::post('github/login','Controllers\Users\SessionController@githubLogin');

// user routes
//
Route::post('users', 'Controllers\Users\UsersController@postCreate');
Route::post('users/validate', 'Controllers\Users\UsersController@postValidate');
Route::post('users/email/requestUsername', 'Controllers\Users\UsersController@requestUsername');
Route::post('users/email/user', 'Controllers\Users\UsersController@getUserByEmail');
Route::get('users/{user_uid}', 'Controllers\Users\UsersController@getIndex');
Route::put('users/{user_uid}', 'Controllers\Users\UsersController@updateIndex');
Route::put('users/{user_uid}/change-password', 'Controllers\Users\UsersController@changePassword');
Route::put('users', 'Controllers\Users\UsersController@updateAll');
Route::delete('users/{user_uid}', 'Controllers\Users\UsersController@deleteIndex');
Route::get('users/{user_uid}/projects', 'Controllers\Users\UsersController@getProjects');
Route::get('users/{user_uid}/memberships', 'Controllers\Users\UsersController@getProjectMemberships');
Route::get('users/{user_uid}/events', 'Controllers\Events\PersonalEventsController@getByUser');
Route::get('users/{user_uid}/events/num', 'Controllers\Events\PersonalEventsController@getNumByUser');
Route::get('users/{user_uid}/events/all/num', 'Controllers\Events\PersonalEventsController@getNumAllByUser');
Route::get('users/{user_uid}/projects/events', 'Controllers\Events\ProjectEventsController@getByUser');
Route::get('users/{user_uid}/projects/events/num', 'Controllers\Events\ProjectEventsController@getNumByUser');
Route::get('users/{user_uid}/projects/users/events', 'Controllers\Events\ProjectEventsController@getUserProjectEvents');
Route::get('users/{user_uid}/projects/users/events/num', 'Controllers\Events\ProjectEventsController@getNumUserProjectEvents');
Route::get('users/{user_uid}/projects/trial', 'Controllers\Projects\ProjectsController@getUserTrialProject');

// permission routes
//
Route::get('users/{user_uid}/permissions', 'Controllers\Users\PermissionsController@getPermissions');
Route::post('users/{user_uid}/permissions', 'Controllers\Users\PermissionsController@requestPermissions');
Route::put('users/{user_uid}/permissions', 'Controllers\Users\PermissionsController@setPermissions');
Route::delete('user_permissions/{user_permission_uid}', 'Controllers\Users\PermissionsController@deletePermission');
Route::get('user_permissions/{user_uid}/{permission_code}', 'Controllers\Users\PermissionsController@lookupPermission');
Route::put('user_permissions/{user_uid}/{permission_code}', 'Controllers\Users\PermissionsController@requestPermission');
Route::post('user_permissions/{user_permission_uid}/project/{project_uid}', 'Controllers\Users\PermissionsController@designateProject');
Route::post('user_permissions/{user_permission_uid}/package/{package_uuid}', 'Controllers\Users\PermissionsController@designatePackage');

// policy routes
//
Route::get('policies/{policy_code}', 'Controllers\Users\PoliciesController@getByCode');
Route::post('user_policies/{policy_code}/user/{user_uid}', 'Controllers\Users\UserPoliciesController@markAcceptance');

// restricted domain routes
//
Route::post('restricted-domains', 'Controllers\Admin\RestrictedDomainsController@postCreate');
Route::get('restricted-domains/{restricted_domain_id}', 'Controllers\Admin\RestrictedDomainsController@getIndex');
Route::put('restricted-domains/{restricted_domain_id}', 'Controllers\Admin\RestrictedDomainsController@updateIndex');
Route::delete('restricted-domains/{restricted_domain_id}', 'Controllers\Admin\RestrictedDomainsController@deleteIndex');
Route::get('restricted-domains', 'Controllers\Admin\RestrictedDomainsController@getAll');
Route::put('restricted-domains', 'Controllers\Admin\RestrictedDomainsController@updateMultiple');

// email verification routes
//
Route::post('verifications', 'Controllers\Users\EmailVerificationsController@postCreate');
Route::post('verifications/resend', 'Controllers\Users\EmailVerificationsController@postResend');
Route::get('verifications/{verification_key}', 'Controllers\Users\EmailVerificationsController@getIndex');
Route::put('verifications/{verification_key}', 'Controllers\Users\EmailVerificationsController@updateIndex');
Route::put('verifications/verify/{verification_key}', 'Controllers\Users\EmailVerificationsController@putVerify');
Route::delete('verifications/{verification_key}', 'Controllers\Users\EmailVerificationsController@deleteIndex');

// password reset routes
//
Route::post('password_resets', 'Controllers\Users\PasswordResetsController@postCreate');
Route::get('password_resets/{password_reset_key}/{password_reset_id}', 'Controllers\Users\PasswordResetsController@getIndex');
Route::put('password_resets/{password_reset_id}/reset', 'Controllers\Users\PasswordResetsController@updateIndex');
Route::delete('password_resets/{password_reset_key}/{password_reset_id}', 'Controllers\Users\PasswordResetsController@deleteIndex');

// project routes
//
Route::post('projects', 'Controllers\Projects\ProjectsController@postCreate');
Route::get('projects/{project_uid}', 'Controllers\Projects\ProjectsController@getIndex');
Route::get('projects/{project_uid}/confirm', 'Controllers\Projects\ProjectsController@getIndex');
Route::get('projects/{project_uid}/users', 'Controllers\Projects\ProjectsController@getUsers');
Route::get('projects/{project_uid}/memberships', 'Controllers\Projects\ProjectsController@getMemberships');
Route::get('projects/{project_uid}/invitations', 'Controllers\Projects\ProjectsController@getInvitations');
Route::get('projects/{project_uid}/events', 'Controllers\Projects\ProjectsController@getEvents');
Route::put('projects/{project_uid}', 'Controllers\Projects\ProjectsController@updateIndex');
Route::put('projects', 'Controllers\Projects\ProjectsController@updateAll');
Route::delete('projects/{project_uid}', 'Controllers\Projects\ProjectsController@deleteIndex');

// project invitation routes
//
Route::post('invitations', 'Controllers\Projects\ProjectInvitationsController@postCreate');
Route::get('invitations/{invitation_key}', 'Controllers\Projects\ProjectInvitationsController@getIndex');
Route::put('invitations/{invitation_key}/accept', 'Controllers\Projects\ProjectInvitationsController@acceptIndex');
Route::put('invitations/{invitation_key}/decline', 'Controllers\Projects\ProjectInvitationsController@declineIndex');
Route::put('invitations/{invitation_key}', 'Controllers\Projects\ProjectInvitationsController@updateIndex');
Route::put('invitations', 'Controllers\Projects\ProjectInvitationsController@updateAll');
Route::delete('invitations/{invitation_key}', 'Controllers\Projects\ProjectInvitationsController@deleteIndex');
Route::get('invitations/{invitation_key}/inviter', 'Controllers\Projects\ProjectInvitationsController@getInviter');
Route::get('invitations/{invitation_key}/invitee', 'Controllers\Projects\ProjectInvitationsController@getInvitee');

// project membership routes
//
Route::post('memberships', 'Controllers\Projects\ProjectMembershipsController@postCreate');
Route::get('memberships/{project_membership_id}', 'Controllers\Projects\ProjectMembershipsController@getIndex');
Route::get('memberships/projects/{project_uid}/users/{user_uid}', 'Controllers\Projects\ProjectMembershipsController@getMembership');
Route::put('memberships/{project_membership_id}', 'Controllers\Projects\ProjectMembershipsController@updateIndex');
Route::put('memberships', 'Controllers\Projects\ProjectMembershipsController@updateAll');
Route::delete('memberships/{project_membership_id}', 'Controllers\Projects\ProjectMembershipsController@deleteIndex');
Route::delete('memberships/projects/{project_uid}/users/{user_uid}', 'Controllers\Projects\ProjectMembershipsController@deleteMembership');

// activity routes
//
Route::post('activities/{user_uid}', 'Controllers\Events\ActivitiesController@postCreate');
Route::get('activities/{activity_uid}', 'Controllers\Events\ActivitiesController@getIndex');
Route::get('activities/users/{user_uid}', 'Controllers\Events\ActivitiesController@getUserActivities');
Route::get('activities/projects/{project_uid}', 'Controllers\Events\ActivitiesController@getProjectActivities');
Route::put('activities/{activity_uid}', 'Controllers\Events\ActivitiesController@updateIndex');
Route::delete('activities/{activity_uid}', 'Controllers\Events\ActivitiesController@deleteIndex');

// admin routes
//
Route::post('admins/{user_uid}', 'Controllers\Admin\AdminsController@postCreate');
Route::get('admins/{user_uid}', 'Controllers\Admin\AdminsController@getIndex');
Route::put('admins/{user_uid}', 'Controllers\Admin\AdminsController@updateIndex');
Route::delete('admins/{user_uid}', 'Controllers\Admin\AdminsController@deleteIndex');
Route::get('admins/{user_uid}/admins', 'Controllers\Admin\AdminsController@getAll');
Route::get('admins/{user_uid}/projects', 'Controllers\Projects\ProjectsController@getAll');
Route::get('admins/{user_uid}/users', 'Controllers\Users\UsersController@getAll');
Route::get('admins/{user_uid}/contacts', 'Controllers\Utilities\ContactsController@getAll');

// admin email
//
Route::post('admins_email', 'Controllers\Admin\AdminsController@sendEmail');

// admin invitation routes
//
Route::post('admin_invitations', 'Controllers\Admin\AdminInvitationsController@postCreate');
Route::get('admin_invitations', 'Controllers\Admin\AdminInvitationsController@getAll');
Route::get('admin_invitations/invitees', 'Controllers\Admin\AdminInvitationsController@getInvitees');
Route::get('admin_invitations/inviters', 'Controllers\Admin\AdminInvitationsController@getInviters');
Route::get('admin_invitations/{invitation_key}', 'Controllers\Admin\AdminInvitationsController@getIndex');
Route::put('admin_invitations/{invitation_key}/accept', 'Controllers\Admin\AdminInvitationsController@acceptIndex');
Route::put('admin_invitations/{invitation_key}/decline', 'Controllers\Admin\AdminInvitationsController@declineIndex');
Route::put('admin_invitations/{invitation_key}', 'Controllers\Admin\AdminInvitationsController@updateIndex');
Route::delete('admin_invitations/{invitation_key}', 'Controllers\Admin\AdminInvitationsController@deleteIndex');

// country routes
//
Route::get('countries', 'Controllers\Utilities\CountriesController@getAll');

// contact routes
//
Route::post('contacts', 'Controllers\Utilities\ContactsController@postCreate');
Route::get('contacts/{contact_uuid}', 'Controllers\Utilities\ContactsController@getIndex');
Route::put('contacts/{contact_uuid}', 'Controllers\Utilities\ContactsController@updateIndex');
Route::delete('contacts/{contact_uuid}', 'Controllers\Utilities\ContactsController@deleteIndex');
