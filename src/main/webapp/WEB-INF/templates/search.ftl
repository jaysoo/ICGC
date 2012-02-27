<#include "base.ftl">

<#macro subnav>
	<div class="subnav">
		<div class="row-fluid" id="app-header">
			<div class="span9">
				<form class="form-search form-inline">
					<select class="pull-left input-medium indices"></select>
					<div id="q" class="pull-left input-xxlarge"></div>
				</form>
			</div>
			<div class="stats span3"></div>
		</div>
	</div>
</#macro>

<#macro page_content>
	<div class="row-fluid">
		<aside class="span4" id="app-sidebar">
			<div class="well facets">
			</div>
		</aside>
		<div class="span8">
			<section id="app-content" class="">
			</section>
		</div>
	</div>
</#macro>

<#macro extra_body>

	<#include "_templates.ftl">
	<script src="${ASSETS_URL}/js/src/dcc.js"></script>
	<script src="${ASSETS_URL}/js/src/application.js"></script>
	<script src="${ASSETS_URL}/js/src/modules/index.js"></script>
	<script src="${ASSETS_URL}/js/src/modules/document.js"></script>
	<script src="${ASSETS_URL}/js/src/modules/facet.js"></script>
	<script src="${ASSETS_URL}/js/src/modules/search.js"></script>

	<script>
	$(function() {
		var Document = DCC.module('document'),
			Index = DCC.module('index'),
			Facet = DCC.module('facet'),
			Search = DCC.module('search');

		var initialDocuments = ${documents};

		DCC.queryTemplates = '${queryTemplate}';
		DCC.queryFacets = ${queryFacets};

		DCC.Indices = new Index.Models.Indices(${indices});
		DCC.Documents = new Document.Models.Documents(DCC.hits(initialDocuments));
		DCC.Search = new Search.Models.Search({ size: ${querySize}, count: initialDocuments.hits.total, searchFields: ${searchFields} } );
		DCC.Facets = new Facet.Models.Facets(DCC.facets(initialDocuments));

		// Initialize main application view
		DCC.App = new DCC.AppView({
			el: $('#application')
		}).render();

	});

	</script>
</#macro> 

<@page_html/>
