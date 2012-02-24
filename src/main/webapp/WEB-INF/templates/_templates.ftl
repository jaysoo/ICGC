<script type="text/html" id="indexTmpl">
	<option {{#selected?}}selected{{/selected?}} value="{{value}}">{{label}}</option>
</script>

<script type="text/html" id="documentTmpl">
<h4>
	<a title="toggle details" class="show-more" href="javascript:void(0)">
		{{ id }}
		<i class="icon-chevron-up"></i>
	</a>
</h4>
{{#additional}}
<div class="additional">
	{{additional}}
</div>
{{/additional}}
<dl class="more well" ${HIDDEN}>
{{#attributes}}
	<dt>{{name}}</dt>
	<dd>{{value}}</dd>
{{/attributes}}
</dl>
</script>

<script type="text/html" id="facetTermsTmpl">
<h4>{{id}}</h4>
<ul>
<li class="all">
	<label for="{{id}}__all" class="term checkbox inline">
		All {{id}}
		<input id="{{id}}__all" type="checkbox" checked="checked" data-action="clear"/>
	</label>
</li>
{{#terms}}
<li data-value="{{term}}">
	<label for="{{id}}_{{term}}" class="term checkbox inline">
		{{term}}
		<input id="{{id}}_{{term}}" type="checkbox"/>
		<small class="count">{{count}}</small>
	</label>
</li>
{{/terms}}
</ul>
<hr/>
</script>

<script type="text/html" id="facetRangeTmpl">
<h4>{{id}}</h4>
<ul>
<li class="all">
	<label for="{{id}}__all" class="term checkbox inline">
		All {{id}}
		<input id="{{id}}__all" type="checkbox" checked="checked" data-action="clear"/>
	</label>
</li>
{{#ranges}}
<li data-to="{{to}}" data-from="{{from}}">
	<label for="{{id}}_{{from}}_{{to}}" class="term checkbox inline">
		{{#from}}
			{{#to}}
				From {{from}} to {{to}}
			{{/to}}
			{{^to}}
				More than {{from}}
			{{/to}}
		{{/from}}
		{{^from}}
			Less than {{to}}
		{{/from}}
		<input id="{{id}}_{{from}}_{{to}}" type="checkbox"/>
		<small class="count">{{count}}</small>
	</label>
</li>
{{/ranges}}
</ul>
<hr/>
</script>

<script type="text/html" id="statsTmpl">
<p>
	{{#count}}
		{{start}} - {{end}} of {{count}} documents
	{{/count}}
	{{^count}}
		No documents found
	{{/count}}
</p>
</script>

<script type="text/html" id="paginationTmpl">
{{#paginate?}}
	<ul>
		<li class="{{^prev?}}disabled{{/prev?}}">
			<a data-page="{{prev}}" href="javascript:void(0)">Prev</a>
		</li>
		{{#pages}}
			<li class="{{#active}}active{{/active}}">
				<a href="javascript:void(0)" data-page="{{num}}">{{num}}</a>
			</li>
		{{/pages}}
		<li class="{{^next?}}disabled{{/next?}}">
			<a data-page="{{next}}" href="javascript:void(0)">Next</a>
		</li>
	</ul>
{{/paginate?}}
</script>

<script type="text/html" id="errorMessageTmpl">
	<div class="modal" ${HIDDEN}>
		<div class="modal-header">
			<a class="close" data-dismiss="modal">&times;</a>
			<h3>{{header}}</h3>
		</div>
		<div class="modal-body">
			{{body}}
		</div>
		<div class="modal-footer">
			<a href="#" class="btn" data-dismiss="modal">Close</a>
		</div>
	</div>
</script>

