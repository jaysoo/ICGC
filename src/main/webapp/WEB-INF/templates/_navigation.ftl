<header class="navbar navbar-fixed-top">
	<div class="navbar-inner">
		<div class="container-fluid">
			<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</a>
			<a class="brand" href="#">${SITE_NAME}</a>
			<nav class="nav-collapse">
				<ul class="nav">
					<li class="<#if currPage == "index">active</#if>"><a href="${PAGES_URL}">Overview</a></li>
					<li class="<#if currPage == "search">active</#if>"><a href="${PAGES_URL}search">Data Access</a></li>
					<li class="<#if currPage == "documentation">active</#if>"><a href="javascript:void(0)">Documentation</a></li>
				</ul>
			</nav>
		</div>
	</div>
</header>

