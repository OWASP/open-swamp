<h1>Please Register to Confirm Project Membership</h1>

<p> You, <%= invitee_name %>, have been sent an invitation to the project '<%= project.get('full_name') %>' by <%= sender.getFullName() %>.  However, there is not currently a user with your email address registered to the SWAMP. To accept the invitation, you must first register to be a SWAMP user using the email address that your invitation was sent to.
</p>
<p>You may either register or decline this invitation.</p>

<div class="buttons">
	<button id="register" class="btn btn-primary btn-large"><i class="fa fa-plus"></i>Register</button>
	<button id="decline" class="btn btn-large"><i class="fa fa-times"></i>Decline</button>
</div>