<#include "base.ftl">

<#macro page_content>
  <div class="row-fluid">
    <aside class="span3">
      <div id="overview-stats" class="well">
        test
      </div>
    </aside>
    <div class="span9">
      <div class="hero-unit well">
        <h1>Welcome to the Data Portal</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ipsum tortor, pharetra ac lacinia sit amet, vulputate non dui. Etiam dolor enim, porta non eleifend eu, tristique non neque.</p>
      </div>
      <div id="charts"></div>
    </div>
  </div>
</#macro>

<#macro extra_body>

<script src="${ASSETS_URL}js/lib/d3.v2.js"></script>

<script>
$(function() {

var query = JSON.stringify({
       "query" : { "match_all" : {} },

       "facets" : {
           "chromosomes" : {
               "terms" : {
                   "field" : "chromosome",
                   "size"  : "10"
               }
           }
       }
    });

$.when(
    $.ajax({
        url: '${SITE_URL}api/search/',
        data : {
            index: 'dcc',
            type: 'ssm',
            source: query
        },
        dataType : 'json'
    })
)
.then(function(json) {
    display_chart(json);
});

function display_chart(json) {
    var w = 500,
        h = 500,
        textOffset = 14;
        data = _.map(json.facets.chromosomes.terms, function(term) {
            return { label: term.term, value: term.count };
        }),
        total = json.facets.chromosomes.total,
        r = Math.min(w, h) / 2 - 50,
        ir = r * .6,
        color = d3.scale.category20(),
        donut = d3.layout.pie().value(function(d){ return d.value;} ),
        pieData = donut(data);
        arc = d3.svg.arc()
            .startAngle(function(d){ return d.startAngle; })
            .endAngle(function(d){ return d.endAngle; })
            .innerRadius(ir).outerRadius(r);

    // Vis and groups
    var vis = d3.select("#charts")
      .append("svg:svg")
        .data([data])
        .attr("width", w)
        .attr("height", h);

    var centerGroup = vis.append("svg:g")
      .attr("class", "center-group")
      .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

    var labelGroup = vis.append("svg:g")
        .attr("class", "label-group")
        .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

    var arcs = vis.selectAll("g.arc")
        .data(donut)
      .enter().append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

    arcs.append("path")
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc);

    arcs.append("svg:text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d, i) {
            return d.value;
        });

    var titleLabel = centerGroup.append("svg:text")
          .attr("class", "chart-label-small")
          .attr("dy", -30)
          .attr("text-anchor", "middle")
          .text("TOTAL"),

        countLabel = centerGroup.append("svg:text")
            .attr("class", "chart-label-large")
            .attr("dy", 10)
            .attr("text-anchor", "middle")
            .text(_.format(total, { separateThousands: true })),

       smallLabel = centerGroup.append("svg:text")
            .attr("class", "chart-label-medium")
            .attr("dy", 40)
            .attr("text-anchor", "middle")
            .text("mutations");


      var lines = labelGroup.selectAll("line").data(pieData);
      lines.enter().append("svg:line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", -r-3)
        .attr("y2", -r-8)
        .attr("stroke", "gray")
        .attr("transform", function(d) {
          return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
        });
      lines.exit().remove();

      valueLabels = labelGroup.selectAll("text.value").data(pieData)
        .attr("dy", function(d){
          if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
            return 5;
          } else {
            return -7;
          }
        })
        .attr("text-anchor", function(d){
          if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
            return "beginning";
          } else {
            return "end";
          }
        })
        .text(function(d, i){
          return data[i].label;
        });

      valueLabels.enter().append("svg:text")
        .attr("class", "chart-label-small")
        .attr("transform", function(d) {
          return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
        })
        .attr("dy", function(d){
          if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
            return 5;
          } else {
            return -7;
          }
        })
        .attr("text-anchor", function(d){
          if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
            return "beginning";
          } else {
            return "end";
          }
        }).text(function(d, i){
          return data[i].label;
        });

      valueLabels.exit().remove();
}

});

</script>

</#macro> 

<@page_html/>
