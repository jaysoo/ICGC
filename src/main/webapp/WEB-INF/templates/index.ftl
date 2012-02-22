<#include "base.ftl">
<#macro page_content>
	<div class="row-fluid">
		<aside class="span4" id="sidebar">
			<form id="search" class="form-search" action="/api/search/" method="GET">
				<input id="q" name="q" type="text" class="input-medium search-query" placeholder="Search">
			</form>
			<div class="well" id="facets">
			</div>
		</aside>
		<div class="span8">
			<section id="application" class="">
				<header>
					<h2>Documents</h2>
				</header>
			</section>
		</div>
	</div>
</#macro>

<#macro extra_body>

	<#include "_templates.ftl">

	<script src="${ASSETS_URL}/js/lib/underscore-min.js"></script>
	<script src="${ASSETS_URL}/js/lib/backbone-min.js"></script>
	<script src="${ASSETS_URL}/js/lib/ICanHaz.min.js"></script>
	<script src="${ASSETS_URL}/js/src/application.js"></script>
	<script src="${ASSETS_URL}/js/src/modules/core.js"></script>

	<script>
	$(function() {
		var Core = DCC.module('core');

		var initialDocuments = ${documents};

		DCC.query = '${query}';
		DCC.queryFacets = ${queryFacets};

		DCC.Documents = new Core.Models.Documents(DCC.hits(initialDocuments));
		DCC.Facets = new Core.Models.Facets(DCC.facets(initialDocuments));

		// Initialize main application view
		DCC.App = new DCC.AppView({
			el: $('#application')
		}).render();

	});

	</script>
</#macro> 

<@page_html/>
