'use strict';
// Modified from tutorial: http://bl.ocks.org/mbostock/3887051

var Chart = (function(window,d3) {
    var neighbs = [];
    var count = [1]; // will use this in conjunction w .data() so that only one 'g' node is added
    var widthRect = [1,2,3,4,5];
    var philly = {
        name: 'Philadelphia',
        ethn: [['African-American'],['White'],['Hispanic/Latino'],['Asian'],['Other']],
        values: [[0.4188],[0.3669],[0.1270],[0.0647],[0.0227]]
    };
    var margin = {};
    var svg, select, chartWrapper, data, width, height, x0, x1, y, xAxis, yAxis, color;

    // load data, initialize chart
    d3.csv('phlneighbs_wdata.csv', init);

    function init(csv) {
        data = csv;

        // initialize scales (ordinal and linear)
        x0 = d3.scale.ordinal();
        x1 = d3.scale.ordinal();
        y = d3.scale.linear();

        color = d3.scale.ordinal()
            .range(["#d0743c", "#a05d56", "#6b486b", "#7b6888", "#8a89a6"]);

        // initialize axes
        xAxis = d3.svg.axis().orient("bottom");
        yAxis = d3.svg.axis().orient("left").tickFormat(d3.format("%"));

        // map the data to ethnicity categories
        data.forEach(function(d) {
            neighbs.push({
                name: d.mapname,
                ethn: [['African-American'],['White'],['Hispanic/Latino'],['Asian'],['Other']],
                values: [d['African-American'],d['White'],d['Hispanic/Latino'],d['Asian'],d['Other']]
            });
        });

        // create dropdown for neighborhood names
        select = d3.select(".d3-chart__select")
            .append("div")
            .append("select")

        select
            .on("change", function(d) {
            var value = d3.select(this).property("value");
            neighbs.forEach(function(d) {
                selectNeighborhood(d, value, svg);
            });
        });

        select.selectAll("option")
            .data(neighbs)
            .enter()
            .append("option")
            .attr("value", function(d) { return d.name; })
            .text(function(d) { return d.name; });

        svg = d3.select("div.d3-chart__graph").append("svg");
        chartWrapper = svg.append("g");

        // render the chart
        render();
    }

    function render() {
        //get dimensions based on window size
        updateDimensions(window.innerWidth);

        //update x and y scales based on new dimensions
        x0.rangeRoundBands([0, width], .1) // .1 sets padding between each group of bands
        y.range([height, 0]);

        //update svg elements to new dimensions
        svg
          .attr('width', width + margin.right + margin.left)
          .attr('height', height + margin.top + margin.bottom);
        chartWrapper.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        //update the axis and line
        xAxis.scale(x0);
        yAxis.scale(y);

        // Map the data to the x0, x1, and y scales
        x0.domain(['Choose Neighborhood',philly.name]);
        x1.domain(philly.values).rangeRoundBands([0, x0.rangeBand()]); // Define the range of the band groups as 0 to x0 range
        y.domain([0, 1]);

        // Append a group element to the svg to contain the x axis with neighborhood names
        chartWrapper.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis); //insert axis into element

        // Append a group element to the svg to contain the y axis with percentage values
        chartWrapper.append("g")
                .attr("class", "y axis")
                .call(yAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Percent");

        // Select and append g element and place in correct position
        var neighb = chartWrapper.selectAll("mapname")
                .data(count)
            .enter().append("g")
                .attr("class", "g")
                .attr("transform", function(d) { return "translate(" + x0(philly.name) + ",0)"; });

        // Create rectangles within 'neighb' and append ethnicity data
        neighb.selectAll("rect")
                .data(philly.values)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("width", x1.rangeBand())
                .attr("x", function(d, i) { return x1(philly.values[i]); })
                .attr("y", height)
                .style("fill", function(d, i) { return color(philly.values[i]); })
                .attr("height", 0)
                .transition()
                .duration(1800)
                .attr({ y: function (d, i) { return y(philly.values[i]); },
                        height: function (d, i) { return height - y(philly.values[i]); }
                });

        var legend = chartWrapper.selectAll(".legend")
            .data(philly.ethn.slice())
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
    }

    function updateDimensions(winWidth) {
        margin.top = 20;
        margin.right = 20;
        margin.left = 40;
        margin.bottom = 30;

        width = winWidth - margin.left - margin.right;
        height = 500 - margin.top - margin.bottom;
    }

    function selectNeighborhood(mapname, value, svg) {
        if(mapname.name === value) {
            // Clean up what's already there
            var axis = svg.select(".x");
            axis.remove();
            var bars = svg.select(".selectNeighb");
            bars.remove();

            // Map the data to the x0, x1, and y scales
            x0.domain([mapname.name,philly.name]);
            x1.domain(widthRect).rangeRoundBands([0, x0.rangeBand()]); // Define the range of the band groups as 0 to x0 range
            y.domain([0, 1]);

            // Append a group element to the svg to contain the x axis with neighborhood names
            chartWrapper.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis); //insert axis into element

            // Select data from the 'mapname' column and append to the x0 group elements
            var neighb = chartWrapper.selectAll(".mapname")
                    .data(count)
                .enter().append("g")
                    .attr("class", "g selectNeighb")
                    .attr("transform", function(d) { return "translate(" + x0(mapname.name) + ",0)"; });

            // Create rectangles within 'neighb' and append ethnicity data
            neighb.selectAll("rect")
                    .data(mapname.values)
                .enter().append("rect")
                    .attr("width", x1.rangeBand())
                    .attr("x", function(d, i) { return x1(widthRect[i]); })
                    .attr("y", height)
                    .style("fill", function(d, i) { return color(widthRect[i]); })
                    .attr("height", 0)
                    .transition()
                    .duration(1800)
                    .attr({ y: function (d, i) { return y(mapname.values[i]); },
                            height: function (d, i) { return height - y(mapname.values[i]); }
                    });
        }
    }

    return {
        render : render
    }

})(window,d3)

window.addEventListener('resize', Chart.render);
// var neighbs = [];
// var count = [1]; // will use this in conjunction w .data() so that only one 'g' node is added
// var widthRect = [1,2,3,4,5];
// var philly = {
//     name: 'Philadelphia',
//     ethn: [['African-American'],['White'],['Hispanic/Latino'],['Asian'],['Other']],
//     values: [[0.4188],[0.3669],[0.1270],[0.0647],[0.0227]]
// };

// // Set up basic dimensions of svg, scales, and axes
// var margin = {top: 20, right: 20, bottom: 30, left: 40},
//     width = 700 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

// var x0 = d3.scale.ordinal()
//     .rangeRoundBands([0, width], .1) // .1 sets padding between each group of bands

// var x1 = d3.scale.ordinal();

// var y = d3.scale.linear()
//     .range([height, 0]);

// var color = d3.scale.ordinal()
//     .range(["#d0743c", "#a05d56", "#6b486b", "#7b6888", "#8a89a6"]);

// var xAxis = d3.svg.axis()
//     .scale(x0)
//     .orient("bottom");

// var yAxis = d3.svg.axis()
//     .scale(y)
//     .orient("left")
//     .tickFormat(d3.format("%"));

// Get data
// d3.csv('phlneighbs_wdata.csv', function(error, data) {
//     // if (error) throw error;
//     // data.forEach(function(d) {
//     //     neighbs.push({
//     //         name: d.mapname,
//     //         ethn: [['African-American'],['White'],['Hispanic/Latino'],['Asian'],['Other']],
//     //         values: [d['African-American'],d['White'],d['Hispanic/Latino'],d['Asian'],d['Other']]
//     //     });
//     // });

//     // // create dropdown for neighborhood names
//     // var select = d3.select(".d3-chart__select")
//     //     .append("div")
//     //     .append("select")

//     // select
//     //     .on("change", function(d) {
//     //     var value = d3.select(this).property("value");
//     //     neighbs.forEach(function(d) {
//     //         render(d, value, svg);
//     //     });
//     // });

//     // select.selectAll("option")
//     //     .data(neighbs)
//     //     .enter()
//     //     .append("option")
//     //     .attr("value", function(d) { return d.name; })
//     //     .text(function(d) { return d.name; });

//     // Create svg element
//     // var svg = d3.select("div.d3-chart__graph")
//     //       .append("svg")
//     //         .attr("width", width + margin.left + margin.right)
//     //         .attr("height", height + margin.top + margin.bottom)
//     //       .append("g")
//     //         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     // // Map the data to the x0, x1, and y scales
//     // x0.domain(['Choose Neighborhood',philly.name]);
//     // x1.domain(philly.values).rangeRoundBands([0, x0.rangeBand()]); // Define the range of the band groups as 0 to x0 range
//     // y.domain([0, 1]);
//     // // Append a group element to the svg to contain the x axis with neighborhood names
//     // svg.append("g")
//     //     .attr("class", "x axis")
//     //     .attr("transform", "translate(0," + height + ")")
//     //     .call(xAxis); //insert axis into element
//     // // Append a group element to the svg to contain the y axis with percentage values
//     // svg.append("g")
//     //         .attr("class", "y axis")
//     //         .call(yAxis)
//     //     .append("text")
//     //         .attr("transform", "rotate(-90)")
//     //         .attr("y", 6)
//     //         .attr("dy", ".71em")
//     //         .style("text-anchor", "end")
//     //         .text("Percent");
//     // // Select and append g element and place in correct position
//     // var neighb = svg.selectAll("mapname")
//     //         .data(count)
//     //     .enter().append("g")
//     //         .attr("class", "g")
//     //         .attr("transform", function(d) { return "translate(" + x0(philly.name) + ",0)"; });
//     // // Create rectangles within 'neighb' and append ethnicity data
//     // neighb.selectAll("rect")
//     //         .data(philly.values)
//     //     .enter().append("rect")
//     //         .attr("class", "bar")
//     //         .attr("width", x1.rangeBand())
//     //         .attr("x", function(d, i) { return x1(philly.values[i]); })
//     //         .attr("y", height)
//     //         .style("fill", function(d, i) { return color(philly.values[i]); })
//     //         .attr("height", 0)
//     //         .transition()
//     //         .duration(1800)
//     //         .attr({ y: function (d, i) { return y(philly.values[i]); },
//     //                 height: function (d, i) { return height - y(philly.values[i]); }
//     //         });

//     // var legend = svg.selectAll(".legend")
//     //     .data(philly.ethn.slice())
//     //     .enter().append("g")
//     //     .attr("class", "legend")
//     //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

//     // legend.append("rect")
//     //     .attr("x", width - 18)
//     //     .attr("width", 18)
//     //     .attr("height", 18)
//     //     .style("fill", color);

//     // legend.append("text")
//     //     .attr("x", width - 24)
//     //     .attr("y", 9)
//     //     .attr("dy", ".35em")
//     //     .style("text-anchor", "end")
//     //     .text(function(d) { return d; });

//     // function render(mapname, value, svg) {
//     //     if(mapname.name === value) {
//     //         // Clean up what's already there
//     //         var axis = svg.select(".x");
//     //         axis.remove();
//     //         var bars = svg.select(".selectNeighb");
//     //         bars.remove();
//     //         // Map the data to the x0, x1, and y scales
//     //         x0.domain([mapname.name,philly.name]);
//     //         x1.domain(widthRect).rangeRoundBands([0, x0.rangeBand()]); // Define the range of the band groups as 0 to x0 range
//     //         y.domain([0, 1]);
//     //         // Append a group element to the svg to contain the x axis with neighborhood names
//     //         svg.append("g")
//     //             .attr("class", "x axis")
//     //             .attr("transform", "translate(0," + height + ")")
//     //             .call(xAxis); //insert axis into element
//     //         // Select data from the 'mapname' column and append to the x0 group elements
//     //         var neighb = svg.selectAll(".mapname")
//     //                 .data(count)
//     //             .enter().append("g")
//     //                 .attr("class", "g selectNeighb")
//     //                 .attr("transform", function(d) { return "translate(" + x0(mapname.name) + ",0)"; });
//     //         // Create rectangles within 'neighb' and append ethnicity data
//     //         neighb.selectAll("rect")
//     //                 .data(mapname.values)
//     //             .enter().append("rect")
//     //                 .attr("width", x1.rangeBand())
//     //                 .attr("x", function(d, i) { return x1(widthRect[i]); })
//     //                 .attr("y", height)
//     //                 .style("fill", function(d, i) { return color(widthRect[i]); })
//     //                 .attr("height", 0)
//     //                 .transition()
//     //                 .duration(1800)
//     //                 .attr({ y: function (d, i) { return y(mapname.values[i]); },
//     //                         height: function (d, i) { return height - y(mapname.values[i]); }
//     //                 });
//     //     }
//     // } // end render()
// });



