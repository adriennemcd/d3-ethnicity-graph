'use strict';
// Modified from tutorial: http://bl.ocks.org/mbostock/3887051

// Define margins around viz, width and height of viz
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 15000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Construct a new ordinal scale object with an empty domain and an empty range for x axis
// Define the range of the bands (bars) as 0 to width as defined above
// This will be used to label the grouped bands
var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1) // .1 sets padding between each group of bands

// Construct a second ordinal scale object with an empty domain and empty range for x axis
var x1 = d3.scale.ordinal();

// Construct a linear scale object with an empty domain and empty range for y axis
// Define the vertical range of the bands as height (as defined above) to 0
var y = d3.scale.linear()
    .range([height, 0]);

// Define a color range for an ordinal scale
var color = d3.scale.ordinal()
    .range(["#d0743c", "#a05d56", "#6b486b", "#7b6888", "#8a89a6"]);

// Create a default x axis
// Set x0 as the scale for the axis and orient labels below the axis
var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

// Create default y axis
// Set y as the scale for the axis, orient labels to the left, use percentage formatting
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format("%"));

// Select body element and append an svg element with width and height attributes
// Append a group element to contain child elements (the axes and groups of bands)
// Use the transform attribute with translate to define starting coordinates of group element
var svg = d3.select("div.chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Call http GET request for CSV with data
d3.csv('phlneighbs_wdata.csv', function(error, data) {
    if (error) throw error;
    // Filter column names for those that will be individual bars in each group
    var ethnNames = d3.keys(data[0]).filter(function(key) { return key !== "mapname"; });
    // For each row of data, map values to column name keys defined above
    data.forEach(function(d) {
        d.ethn = ethnNames.map(function(name) { return {ethnicity: name, value: +d[name]}; });
    });
    // Map the data to the x0, x1, and y scales
    x0.domain(data.map(function(d) { return d.mapname; }));
    x1.domain(ethnNames).rangeRoundBands([0, x0.rangeBand()]); // Define the range of the band groups as 0 to x0 range
    y.domain([0, d3.max(data, function(d) { return d3.max(d.ethn, function(d) { return d.value; }); }) ]);
    // Append a group element to the svg to contain the x axis with neighborhood names
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis); //insert axis into element
    // Append a group element to the svg to contain the y axis with percentage values
    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Percent");
    // Select data from the 'mapname' column and append to the x0 group elements
    var neigb = svg.selectAll(".mapname")
            .data(data)
        .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x0(d.mapname) + ",0)"; });
    // Select rectangles within 'neighb' and append ethnicity data
    neigb.selectAll("rect")
            .data(function(d) { return d.ethn; })
        .enter().append("rect")
            .attr("width", x1.rangeBand())
            .attr("x", function(d) { return x1(d.ethnicity); })
            .attr("y", height)
            .style("fill", function(d) { return color(d.ethnicity); })
            .attr("height", 0)
            .transition()
            .duration(1800)
            .attr({ y: function (d, i) { return y(d.value); },
                    height: function (d, i) { return height - y(d.value); }
            });


    var legend = svg.selectAll(".legend")
        .data(ethnNames.slice())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
});



// });
