
<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
	<h1>Project Ownership Request Status</h1>
</div>
<div class="modal-body">
	<p>Your request for project ownership privileges is <strong><%= project_owner_permission.get('status') %></strong>.<br/><br/>
	To renew or request permissions please review your <a class="link" href="/#my-account/permissions">account permissions<a/>.</p>
</div>
<div class="modal-footer">
	<button id="accept-project-ownership-policy" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>OK</button>
</div>
