<% if( type == 'not-verified' ){ %>

	<h1>GitHub Login Error</h1>
	<p>Your SWAMP account has not been verified.<br/><br/>
		Please check your email for a SWAMP account verification message and follow the enclosed instructions. If you cannot locate your verification email please do the following:</p>
	<ol>
		<li>Click the "Sign In" button located in the page header.</li>
		<li>Provide your SWAMP username and password and click OK.</li>
		<li>Review the "Email Verification Error" dialog and click "Resend" to send another copy of the verification email to your SWAMP email address.</li>
	</ol>
	<p>If problems persist, please contact our support staff at: <a href="mailto:support@continuousassurance.org">support@continuousassurance.org</a>.</p>

<% } else if( type == 'not-enabled' ){ %>

	<h1>SWAMP Account Disabled</h1>
	<p>A SWAMP administrator disabled your SWAMP account.<br/>
	<p>If you feel this was in error, please contact our support staff at: <a href="mailto:support@continuousassurance.org">support@continuousassurance.org</a>.</p>

<% } else if( type == 'github-account-disabled' ){ %>

	<h1>SWAMP GitHub Authentication Disabled</h1>
	<p>A SWAMP administrator disabled your GitHub linked account and you will not be able to use it for authentication at this time. Please sign in using your SWAMP credentials.<br/>
	<p>If you feel this was in error, please contact our support staff at: <a href="mailto:support@continuousassurance.org">support@continuousassurance.org</a>.</p>

<% } else if( type == 'github-auth-disabled' ){ %>

	<h1>SWAMP GitHub Authentication Disabled</h1>
	<p>The SWAMP has disabled GitHub authentication at the current time for security purposes.  Please sign in using your SWAMP credentials.<br/>
	<p>If you have questions or concerns, please contact our support staff at: <a href="mailto:support@continuousassurance.org">support@continuousassurance.org</a>.</p>

<% } %>
