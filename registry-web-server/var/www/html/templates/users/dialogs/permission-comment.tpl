<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
	<h1 id="modal-header-text">
		<% if (title) { %>
		<%= title %>
		<% } else { %>
		Confirm
		<% } %>
	</h1>
</div>

<div class="modal-body">
	<p><%= message %></p>
	<% if ( ! changeUserPermissions ) { %>
	<p class="policy-error-message" style="display: none; text-align: center; font-weight: bold; color: red">You must first read the policy and check the "I accept" box at the bottom to proceed.</p>
	<%= policy %>
	<% } else { %>
	<label style="width: auto;">User Justification</label><br/>
	<p><%= user_comment %></p>
	<%
		var output = '';
		if( meta_information && meta_information.length > 2 ){
			var output = '';
			meta_information = JSON.parse( meta_information );
			if( typeof meta_information === 'object' ){
				output += '<label style="width: auto;">Meta Information</label><br/><p>'
				for( var prop in meta_information ){
					output += '<b>' + prop + ':</b> ' + meta_information[prop] + '<br/><br/>';
				}
				output += '</p>';
			}
		}
	%>
	<%= output %>
	<% } %>

	<form action="/" class="form-horizontal">
		<input type="hidden" name="permission_code" value="<%= permission_code %>">
		<input type="hidden" name="title" value="<%= title %>">

		<% if (!changeUserPermissions) { %>
		<div class="control-group" style="text-align: center;">
			I accept <input type="checkbox" no-focus name="accept_policy" class="required" style="min-width: 25px; width: 25px; display: inline; margin: 0 10px 0 0;">
		</div>
		<% } else { %>
		<input type="hidden" name="status" value="<%= status %>">
		<% } %>

		<div id="tool-form"></div>

		<div class="control-group">
			<label class="control-label required" style="width: auto;">Justification</label>
			<textarea maxlength="8000" style="width: 660px; height: 225px; resize: none; margin: 10px 0 0 0;" name="comment" class="required" data-toggle="popover" data-placement="right" data-content="Please type your comment here."></textarea>
		</div>

		<div align="right">
			<h3><span class="required"></span>Fields are required</h3>
		</div>
	</form>
</div>

<div class="modal-footer">
	<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>
		<% if (ok) { %><%= ok %><% } else { %>OK<% } %>
	</button>
	<button id="cancel" class="btn" data-dismiss="modal"><i class="fa fa-times"></i>
		<% if (cancel) { %><%= cancel %><% } else { %>Cancel<% } %>
	</button>
</div>
