<#macro extra_head></#macro> 
<#macro page_content></#macro> 
<#macro extra_body></#macro> 
<#macro page_html> 
<!doctype html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

  <title>${SITE_NAME}</title>

  <#include "_head.ftl"> 

  <@extra_head/>
</head>

<body>
  <#include "_navigation.ftl">

  <div id="main">
    <div class="container-fluid">
      <div class="content">
        <@page_content/>
      </div>
    </div>
  </div>

  <#include "_footer.ftl">

  <#include "_extra_body.ftl">
  <@extra_body/>
</body>
</html>

</#macro> <#-- END: page_html -->

