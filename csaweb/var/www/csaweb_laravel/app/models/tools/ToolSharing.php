<?php

namespace Models\Tools;

use Models\BaseModel;

class ToolSharing extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'tool_sharing_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'tool_shed';
	protected $table = 'tool_sharing';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'tool_uuid',
		'project_uuid'
	);

	/**
	 * relations
	 */
	public function tool() {
		return $this->belongsTo('Models\Tools\Tool', 'tool_uuid');
	}
}