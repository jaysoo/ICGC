<#include "base.ftl">

<#macro page_content>
  <div id="charts" class="row">
      <div class="span4">
        <div id="stats" class="hero-unit  well">
            <h1>Statistics</h1>
            <h2>Total documents</h2>
            <dl>
              <dt>Genes</dt>
              <dd>${geneTotal}</dd>
              <dt>Somatic mutations</dt>
              <dd>${ssmTotal}</dd>
              <dt>Donors</dt>
              <dd>${donorTotal}</dd>
            </dl>
        </div>
        <div class="well">
            <h2>Data access</h2>
            <ul>
                <li><a href="${PAGES_URL}search">Search documents</a></li>
            </ul>
        </div>
    </div>
  </div>
</#macro>

<#macro extra_body>

<script src="${ASSETS_URL}js/lib/d3.v2.js"></script>

<script>
/*
 * WARNING: The following code is for demo purposes, and will need more structure to be production ready!
 */
$(function() {

// Mutation data
(function() {
var query = JSON.stringify({
       "query" : { "match_all" : {} },

       "facets" : {
           "chromosomes" : {
               "terms" : {
                   "field" : "chromosome",
                   "size"  : "15"
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
    processJSON(json, 'Top chromosomes by mutations', 'mutations');
});
})();

// Gene data
(function() {
var query = JSON.stringify({
       "query" : { "match_all" : {} },

       "facets" : {
           "chromosomes" : {
               "terms" : {
                   "field" : "chromosome",
                   "size"  : "15"
               }
           }
       }
    });

$.when(
    $.ajax({
        url: '${SITE_URL}api/search/',
        data : {
            index: 'dcc',
            type: 'gene',
            source: query
        },
        dataType : 'json'
    })
)
.then(function(json) {
    processJSON(json, 'Top chromosomes by genes', 'genes');
});
})();


function processJSON(json, title, unit) {
    var $charts = $("#charts");

    for (var k in json.facets) {
        var data = _.map(json.facets[k].terms, function(term) {
                return { label: term.term, value: term.count };
            }),
            total = json.facets[k].total,
            $el =  $('<div id="chart-' + k + '" class="span6 chart">').appendTo($charts);

        $el.html('<h3>' + title + '</h3><div class="chart-content"/>');

        drawChart($el.find('.chart-content')[0], total, data, unit);
    }
}

function drawChart(el, total, data, unit) {
    var w = 560,
        h = 560,
        textOffset = 14;
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
    var vis = d3.select(el)
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
            .text(unit);


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
