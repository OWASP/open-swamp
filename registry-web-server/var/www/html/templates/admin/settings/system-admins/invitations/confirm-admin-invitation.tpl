<h1>Confirm Administrator Membership</h1>

<p>You, <%= invitee.getFullName() %>, have been sent an invitation to become a SWAMP administrator by <%= inviter.getFullName() %>.  
</p>
<p>You may accept or decline this invitation.</p>

<div class="buttons">
	<button id="accept" class="btn btn-primary btn-large"><i class="fa fa-plus"></i>Accept</button>
	<button id="decline" class="btn btn-large"><i class="fa fa-times"></i>Decline</button>
</div>