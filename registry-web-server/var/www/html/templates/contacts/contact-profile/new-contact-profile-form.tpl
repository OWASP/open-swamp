<form action="/" class="new-contact form-horizontal">
	<div class="control-group">
		<div class="accordion" id="contact-info-accordion">
			<div class="accordion-group">
				<% var collapsed = (typeof email == 'undefined'); %>

				<div class="accordion-heading">
					<label>
					<a class="accordion-toggle" data-toggle="collapse" data-parent="#contact-info-accordion" href="#contact-info">
						<% if (collapsed) { %>
							<i class="fa fa-plus-circle"></i>
						<% } else { %>
							<i class="fa fa-minus-circle"></i>
						<% } %>
						Your contact info
					</a>
					</label>
				</div>

				<div id="contact-info" class="accordion-body nested collapse <% if (!collapsed) { %>in<% } %>">
					<p>If you'd like us to contact you with answers to your questions or a response to your feedback, please include your contact information here.</p>

					<div class="control-group">
						<label class="control-label">First name:</label>
						<div class="controls">
							<input type="text" name="first-name" id="first-name" <% if (typeof first_name != 'undefined') { %>value="<%= first_name %>"<% } %> data-toggle="popover" data-placement="right" title="First name" data-content="This is the informal name that you are called by." /> 
						</div>
					</div>
					<div class="control-group">
						<label class="control-label">Last name:</label>
						<div class="controls">
							<input type="text" name="last-name" id="last-name" <% if (typeof last_name != 'undefined') { %>value="<%= last_name %>"<% } %> data-toggle="popover" data-placement="right" title="Last name" data-content="This is your family name." /> 
						</div>
					</div>
					<div class="control-group">
						<label class="control-label">Email address</label>
						<div class="controls">
							<input type="text" name="email" id="email" class="email" <% if (typeof email != 'undefined') { %>value="<%= email %>"<% } %> data-toggle="popover" data-placement="right" title="Email address" data-content="Please enter an email address if you'd like us to respond to your inquiry." />
						</div>
					</div>
				</div>
				
			</div>
		</div>
	</div>

	<fieldset>
		<legend>Question</legend>
		<div class="control-group">
			<label class="required control-label">Subject</label>
			<div class="controls">
				<input type="text" name="subject" id="subject" class="required" data-toggle="popover" data-placement="right" title="Subject" data-content="This is the subject of your question or comment." /> 
			</div>
		</div>

		<div class="control-group">
			<label class="required control-label">Body</label>
			<div class="controls">
				<textarea rows="6" id="question" class="required" data-toggle="popover" data-placement="right" title="Question" data-content="Please type your question or comment here."></textarea>
			</div>
		</div>
	</fieldset>

	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>	
</form>
