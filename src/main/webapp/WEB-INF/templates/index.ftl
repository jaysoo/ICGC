<#include "base.ftl">

<#macro subnav>
	<div class="subnav" id="subnav">
		<form id="search">
			<input id="q" name="q" type="text" class="pull-left input-xxlarge search-query" placeholder="Search">
			<i title="clear search" class="close pull-left">&times;</i>
		</form>
		<div id="stats" class="pull-right"></div>
	</div>
</#macro>

<#macro page_content>
	<div class="row-fluid">
		<aside class="span4" id="sidebar">
			<div class="well" id="facets">
			</div>
		</aside>
		<div class="span8">
			<section id="application" class="">
			</section>
		</div>
	</div>
</#macro>

<#macro extra_body>

	<#include "_templates.ftl">
	<script src="${ASSETS_URL}/js/src/application.js"></script>
	<script src="${ASSETS_URL}/js/src/modules/document.js"></script>
	<script src="${ASSETS_URL}/js/src/modules/facet.js"></script>
	<script src="${ASSETS_URL}/js/src/modules/search.js"></script>

	<script>
	$(function() {
		var Document = DCC.module('document'),
			Facet = DCC.module('facet'),
			Search = DCC.module('search');

		var initialDocuments = ${documents};

		DCC.queryTemplates = '${queryTemplate}';
		DCC.queryFacets = ${queryFacets};

		DCC.Documents = new Document.Models.Documents(DCC.hits(initialDocuments));
		DCC.Search = new Search.Models.Search({ size: ${querySize}, count: initialDocuments.hits.total} );
		DCC.Facets = new Facet.Models.Facets(DCC.facets(initialDocuments));

		// Initialize main application view
		DCC.App = new DCC.AppView({
			el: $('#application')
		}).render();

	});

	</script>
</#macro> 

<@page_html/>
