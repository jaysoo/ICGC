<script type="text/html" id="documentTmpl">
<h3>{{ id }}</h3>
<dl class="more" ${HIDDEN}>
{{#attributes}}
	<dt>{{name}}</dt>
	<dd>{{value}}</dd>
{{/attributes}}
</dl>
</script>

<script type="text/html" id="facetTermsTmpl">
<h4>{{id}}</h4>
<ul>
<li data-value="_all">
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
<li data-value="_all">
	<label for="{{id}}__all" class="term checkbox inline">
		All {{id}}
		<input id="{{id}}__all" type="checkbox" checked="checked"/>
	</label>
</li>
{{#ranges}}
<li data-value="{{term}}">
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

