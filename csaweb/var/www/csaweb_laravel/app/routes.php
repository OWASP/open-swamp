<?php

use Models\Users\User;

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

Route::get('/', function() {
	return View::make('swamphome');
});

Route::any('{all}', 'Controllers\Proxies\ProxyController@proxyCodeDxRequest')->where('all', '^proxy-.*');

// login routes
//
Route::post('login', 'Controllers\Users\SessionController@postLogin'); 
Route::post('logout', 'Controllers\Users\SessionController@postLogout'); 
Route::get('users/{user_uid}', 'Controllers\Users\UsersController@getIndex');

// github login
//
Route::post('github/login','Controllers\Users\SessionController@githubLogin');

// project routes
//
Route::get('projects/{project_uuid}/assessment_runs', 'Controllers\Assessments\AssessmentRunsController@getByProject');
Route::get('projects/{project_uuid}/assessment_runs/num', 'Controllers\Assessments\AssessmentRunsController@getNumByProject');
Route::get('projects/{project_uuid}/run_requests', 'Controllers\Assessments\AssessmentRunsController@getRunRequestsByProject');
Route::get('projects/{project_uuid}/run_requests/schedules', 'Controllers\RunRequests\RunRequestsController@getByProject');
Route::get('projects/{project_uuid}/assessment_runs/scheduled', 'Controllers\Assessments\AssessmentRunsController@getScheduledByProject');
Route::get('projects/{project_uuid}/assessment_runs/scheduled/num', 'Controllers\Assessments\AssessmentRunsController@getNumScheduledByProject');
Route::get('projects/{project_uuid}/run_requests/schedules/num', 'Controllers\RunRequests\RunRequestsController@getNumByProject');
Route::get('projects/{project_uuid}/execution_records', 'Controllers\Executions\ExecutionRecordsController@getByProject');
Route::get('projects/{project_uuid}/execution_records/num', 'Controllers\Executions\ExecutionRecordsController@getNumByProject');
Route::get('projects/{project_uuid}/assessment_results', 'Controllers\Assessments\AssessmentResultsController@getByProject');

// package routes
//
Route::get('packages/public', 'Controllers\Packages\PackagesController@getPublic');
Route::get('packages/types', 'Controllers\Packages\PackagesController@getTypes');
Route::group(array('before' => 'filter_packages'), function()
{
	Route::get('packages/all', 'Controllers\Packages\PackagesController@getAll');
	Route::get('packages/{package_uuid}', 'Controllers\Packages\PackagesController@getIndex');
	Route::get('packages/versions/{package_version_uuid}', 'Controllers\Packages\PackageVersionsController@getIndex');
	Route::post('packages', 'Controllers\Packages\PackagesController@postCreate');
	Route::get('packages/protected/{project_uuid}', 'Controllers\Packages\PackagesController@getProtected');
	Route::get('packages/protected/{project_uuid}/num', 'Controllers\Packages\PackagesController@getNumProtected');
	Route::get('packages/users/{user_uuid}', 'Controllers\Packages\PackagesController@getByUser');
	Route::get('packages/users/{user_uuid}/num', 'Controllers\Packages\PackagesController@getNumByUser');
	Route::get('packages/projects/{project_uuid}', 'Controllers\Packages\PackagesController@getByProject');
	Route::get('packages/{package_uuid}/versions', 'Controllers\Packages\PackagesController@getVersions');
	Route::get('packages/{package_uuid}/{project_uuid}/versions', 'Controllers\Packages\PackagesController@getSharedVersions');
	Route::get('packages/{package_uuid}/sharing', 'Controllers\Packages\PackagesController@getSharing');
	Route::put('packages/{package_uuid}', 'Controllers\Packages\PackagesController@updateIndex');
	Route::put('packages/{package_uuid}/sharing', 'Controllers\Packages\PackagesController@updateSharing');
	Route::post('packages/{package_uuid}/sharing/apply-all', 'Controllers\Packages\PackagesController@applyToAll');
	Route::delete('packages/{package_uuid}', 'Controllers\Packages\PackagesController@deleteIndex');
	Route::delete('packages/{package_uuid}/versions', 'Controllers\Packages\PackagesController@deleteVersions');
});

// package version dependency routes
//
Route::post('packages/versions/dependencies', 'Controllers\Packages\PackageVersionsController@postPackageVersionDependencies');
Route::put('packages/versions/dependencies', 'Controllers\Packages\PackageVersionsController@putPackageVersionDependencies');
Route::get('packages/versions/dependencies/recent/{package_uuid}', 'Controllers\Packages\PackageVersionsController@getMostRecentPackageVersionDependencies');
Route::get('packages/versions/dependencies/{package_version_uuid}', 'Controllers\Packages\PackageVersionsController@getPackageVersionDependenciesByPackageVersion');

// package version routes
//
Route::group(array('before' => 'filter_packages'), function()
{
	Route::post('packages/versions/upload', 'Controllers\Packages\PackageVersionsController@postUpload');
	Route::post('packages/versions', 'Controllers\Packages\PackageVersionsController@postCreate');
	Route::post('packages/versions/store', 'Controllers\Packages\PackageVersionsController@postStore');
	Route::post('packages/versions/{package_version_uuid}/add', 'Controllers\Packages\PackageVersionsController@postAdd');

	// newly uploaded package version inspection routes
	//
	Route::get('packages/versions/new/contains', 'Controllers\Packages\PackageVersionsController@getNewContains');
	Route::get('packages/versions/new/build-system', 'Controllers\Packages\PackageVersionsController@getNewBuildSystem');
	Route::post('packages/versions/new/file-types', 'Controllers\Packages\PackageVersionsController@postNewFileTypes');
	Route::get('packages/versions/new/file-list', 'Controllers\Packages\PackageVersionsController@getNewFileInfoList');
	Route::get('packages/versions/new/file-tree', 'Controllers\Packages\PackageVersionsController@getNewFileInfoTree');
	Route::get('packages/versions/new/directory-list', 'Controllers\Packages\PackageVersionsController@getNewDirectoryInfoList');
	Route::get('packages/versions/new/directory-tree', 'Controllers\Packages\PackageVersionsController@getNewDirectoryInfoTree');

	// package version inspection routes
	//
	Route::post('packages/versions/build-system/check', 'Controllers\Packages\PackageVersionsController@postBuildSystemCheck');
	Route::get('packages/versions/{package_version_uuid}/contains', 'Controllers\Packages\PackageVersionsController@getContains');	
	Route::get('packages/versions/{package_version_uuid}/build-system', 'Controllers\Packages\PackageVersionsController@getBuildSystem');
	Route::post('packages/versions/{package_version_uuid}/file-types', 'Controllers\Packages\PackageVersionsController@postFileTypes');
	Route::get('packages/versions/{package_version_uuid}/file-list', 'Controllers\Packages\PackageVersionsController@getFileInfoList');
	Route::get('packages/versions/{package_version_uuid}/file-tree', 'Controllers\Packages\PackageVersionsController@getFileInfoTree');
	Route::get('packages/versions/{package_version_uuid}/directory-list', 'Controllers\Packages\PackageVersionsController@getDirectoryInfoList');
	Route::get('packages/versions/{package_version_uuid}/directory-tree', 'Controllers\Packages\PackageVersionsController@getDirectoryInfoTree');
	Route::put('packages/versions/{package_version_uuid}', 'Controllers\Packages\PackageVersionsController@updateIndex');
	Route::get('packages/versions/{package_version_uuid}/sharing', 'Controllers\Packages\PackageVersionsController@getSharing');
	Route::put('packages/versions/{package_version_uuid}/sharing', 'Controllers\Packages\PackageVersionsController@updateSharing');
	Route::get('packages/versions/{package_version_uuid}/download', 'Controllers\Packages\PackageVersionsController@getDownload');
	Route::delete('packages/versions/{package_version_uuid}', 'Controllers\Packages\PackageVersionsController@deleteIndex');
});

// tool routes
//
Route::get('tools/public', 'Controllers\Tools\ToolsController@getPublic');
Route::group(array('before' => 'filter_tools'), function()
{
	Route::post('tools', 'Controllers\Tools\ToolsController@postCreate');
	Route::get('tools/protected/{project_uuid}', 'Controllers\Tools\ToolsController@getProtected');
	Route::get('tools/all', 'Controllers\Tools\ToolsController@getAll');
	Route::get('tools/users/{user_uuid}', 'Controllers\Tools\ToolsController@getByUser');
	Route::get('tools/projects/{project_uuid}', 'Controllers\Tools\ToolsController@getByProject');
	Route::get('tools/{tool_uuid}', 'Controllers\Tools\ToolsController@getIndex');
	Route::get('tools/{tool_uuid}/versions', 'Controllers\Tools\ToolsController@getVersions');
	Route::get('tools/{tool_uuid}/sharing', 'Controllers\Tools\ToolsController@getSharing');
	Route::get('tools/{tool_uuid}/policy', 'Controllers\Tools\ToolsController@getPolicy');
	Route::post('tools/{tool_uuid}/permission', 'Controllers\Tools\ToolsController@getToolPermissionStatus');
	Route::put('tools/{tool_uuid}', 'Controllers\Tools\ToolsController@updateIndex');
	Route::put('tools/{tool_uuid}/sharing', 'Controllers\Tools\ToolsController@updateSharing');
	Route::delete('tools/{tool_uuid}', 'Controllers\Tools\ToolsController@deleteIndex');
	Route::delete('tools/{tool_uuid}/versions', 'Controllers\Tools\ToolsController@deleteVersions');
});

// tool version routes
//
Route::group(array('before' => 'filter_tools'), function()
{
	Route::post('tools/versions/upload', 'Controllers\Tools\ToolVersionsController@postUpload');
	Route::post('tools/versions', 'Controllers\Tools\ToolVersionsController@postCreate');
	Route::post('tools/versions/{tool_version_uuid}/add', 'Controllers\Tools\ToolVersionsController@postAdd');
	Route::get('tools/versions/{tool_version_uuid}', 'Controllers\Tools\ToolVersionsController@getIndex');
	Route::put('tools/versions/{tool_version_uuid}', 'Controllers\Tools\ToolVersionsController@updateIndex');
	Route::delete('tools/versions/{tool_version_uuid}', 'Controllers\Tools\ToolVersionsController@deleteIndex');
});

// platform routes
//
Route::post('platforms', 'Controllers\Platforms\PlatformsController@postCreate');
Route::get('platforms/users/{user_uuid}', 'Controllers\Platforms\PlatformsController@getByUser');
Route::get('platforms/all', 'Controllers\Platforms\PlatformsController@getAll');
Route::get('platforms/public', 'Controllers\Platforms\PlatformsController@getPublic');
Route::get('platforms/protected/{project_uuid}', 'Controllers\Platforms\PlatformsController@getProtected');
Route::get('platforms/projects/{project_uuid}', 'Controllers\Platforms\PlatformsController@getByProject');
Route::get('platforms/{platform_uuid}', 'Controllers\Platforms\PlatformsController@getIndex');
Route::get('platforms/{platform_uuid}/versions', 'Controllers\Platforms\PlatformsController@getVersions');
Route::get('platforms/{platform_uuid}/sharing', 'Controllers\Platforms\PlatformsController@getSharing');
Route::put('platforms/{platform_uuid}', 'Controllers\Platforms\PlatformsController@updateIndex');
Route::put('platforms/{platform_uuid}/sharing', 'Controllers\Platforms\PlatformsController@updateSharing');
Route::delete('platforms/{platform_uuid}', 'Controllers\Platforms\PlatformsController@deleteIndex');
Route::delete('platforms/{platform_uuid}/versions', 'Controllers\Platforms\PlatformsController@deleteVersions');

// platform version routes
//
Route::post('platforms/versions/upload', 'Controllers\Platforms\PlatformVersionsController@postUpload');
Route::post('platforms/versions', 'Controllers\Platforms\PlatformVersionsController@postCreate');
Route::post('platforms/versions/{platform_version_uuid}/add', 'Controllers\Tools\PlatformVersionsController@postAdd');
Route::get('platforms/versions/all', 'Controllers\Platforms\PlatformVersionsController@getAll');
Route::get('platforms/versions/{platform_version_uuid}', 'Controllers\Platforms\PlatformVersionsController@getIndex');
Route::put('platforms/versions/{platform_version_uuid}', 'Controllers\Platforms\PlatformVersionsController@updateIndex');
Route::delete('platforms/versions/{platform_version_uuid}', 'Controllers\Platforms\PlatformVersionsController@deleteIndex');

// assessment run routes
//
Route::post('assessment_runs/check_compatibility', 'Controllers\Assessments\AssessmentRunsController@checkCompatibility');
Route::post('assessment_runs', 'Controllers\Assessments\AssessmentRunsController@postCreate');
Route::get('assessment_runs/{assessment_run_uuid}', 'Controllers\Assessments\AssessmentRunsController@getIndex');
Route::put('assessment_runs/{assessment_run_uuid}', 'Controllers\Assessments\AssessmentRunsController@updateIndex');
Route::delete('assessment_runs/{assessment_run_uuid}', 'Controllers\Assessments\AssessmentRunsController@deleteIndex');
Route::get('assessment_runs/{assessment_run_uuid}/run_requests', 'Controllers\Assessments\AssessmentRunsController@getRunRequests');

// run request routes
//
Route::post('run_requests', 'Controllers\RunRequests\RunRequestsController@postCreate');
Route::post('run_requests/one-time', 'Controllers\RunRequests\RunRequestsController@postOneTimeAssessmentRunRequests');
Route::post('run_requests/{run_request_uuid}', 'Controllers\RunRequests\RunRequestsController@postAssessmentRunRequests');
Route::get('run_requests', 'Controllers\RunRequests\RunRequestsController@getAll');
Route::get('run_requests/{run_request_uuid}', 'Controllers\RunRequests\RunRequestsController@getIndex');
Route::put('run_requests/{run_request_uuid}', 'Controllers\RunRequests\RunRequestsController@updateIndex');
Route::delete('run_requests/{run_request_uuid}/assessment_runs/{assessment_run_uuid}', 'Controllers\RunRequests\RunRequestsController@deleteAssessmentRunRequest');
Route::delete('run_requests/{run_request_uuid}', 'Controllers\RunRequests\RunRequestsController@deleteIndex');

// run request schedule routes
//
Route::post('run_request_schedules', 'Controllers\RunRequests\RunRequestSchedulesController@postCreate');
Route::get('run_request_schedules/{run_request_schedule_uuid}', 'Controllers\RunRequests\RunRequestSchedulesController@getIndex');
Route::get('run_request_schedules/run_requests/{run_request_uuid}', 'Controllers\RunRequests\RunRequestSchedulesController@getByRunRequest');
Route::put('run_request_schedules/{run_request_schedule_uuid}', 'Controllers\RunRequests\RunRequestSchedulesController@updateIndex');
Route::put('run_request_schedules', 'Controllers\RunRequests\RunRequestSchedulesController@updateMultiple');
Route::delete('run_request_schedules/{run_request_schedule_uuid}', 'Controllers\RunRequests\RunRequestSchedulesController@deleteIndex');

// viewers routes
//
Route::get('viewers/all', 'Controllers\Viewers\ViewersController@getAll');
Route::get('viewers/default/{project_uid}', 'Controllers\Viewers\ViewersController@getDefaultViewer');
Route::put('viewers/default/{project_uid}/viewer/{viewer_uuid}', 'Controllers\Viewers\ViewersController@setDefaultViewer');

// execution record routes
//
Route::get('execution_records/all', 'Controllers\Executions\ExecutionRecordsController@getAll');
Route::get('execution_records/{execution_record_uuid}', 'Controllers\Executions\ExecutionRecordsController@getIndex');
Route::get('execution_records/{execution_record_uuid}/ssh_access', 'Controllers\Executions\ExecutionRecordsController@getSshAccess');
Route::delete('execution_records/{execution_record_uuid}', 'Controllers\Executions\ExecutionRecordsController@deleteIndex');

// assessment results routes
//
Route::get('assessment_results/{assessment_result_uuid}', 'Controllers\Assessments\AssessmentResultsController@getIndex');
Route::get('assessment_results/{assessment_result_uuid}/viewer/{viewer_uuid}/project/{project_uuid}', 'Controllers\Assessments\AssessmentResultsController@getResults');
Route::get('assessment_results/{assessment_result_uuid}/viewer/{viewer_uuid}/project/{project_uuid}/permission', 'Controllers\Assessments\AssessmentResultsController@getResultsPermission');
Route::get('assessment_results//viewer/{viewer_uuid}/project/{project_uuid}/permission', 'Controllers\Assessments\AssessmentResultsController@getNoResultsPermission');
Route::get('assessment_results/viewer_instance/{viewer_instance_uuid}', 'Controllers\Assessments\AssessmentResultsController@getInstanceStatus');
