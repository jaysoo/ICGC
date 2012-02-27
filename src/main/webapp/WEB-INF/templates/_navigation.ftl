<header class="navbar navbar-fixed-top">
	<div class="navbar-inner">
		<div class="container-fluid">
			<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</a>
			<a class="brand" href="${SITE_URL}">${SITE_NAME}</a>
			<nav class="nav-collapse">
				<ul class="nav">
					<li <#if currPage == "index">active</#if>"><a href="${PAGES_URL}">Overview</a></li>
					</li>
					<li class="dropdown">
						<a class="<#if currPage == "search">active</#if> dropdown-toggle" data-toggle="dropdown" href="#search-menu">
							Data Access
							<b class="icon-white caret"></b>
						</a>
						<ul class="dropdown-menu">
							<li><a href="${PAGES_URL}search">Search documents</a></li>
						</ul>
					</li>
					<li class="<#if currPage == "documentation">active</#if>"><a href="javascript:void(0)">Documentation</a></li>
				</ul>
			</nav>
		</div>
	</div>
</header>

