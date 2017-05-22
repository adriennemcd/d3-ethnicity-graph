'use strict';

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
    var svg, select, chartWrapper, tip, legend, legendItem, phillyChart, neighbChart, data, width, height, x0, x1, y, xAxis, yAxis, color;

    // load data, initialize chart
    d3.csv('phlneighbs_wdata.csv', init);

    function init(csv) {
        data = csv;

        // initialize scales (ordinal and linear)
        x0 = d3.scale.ordinal();
        x1 = d3.scale.ordinal();
        y = d3.scale.linear();

        color = d3.scale.ordinal()
            .range(['#0EDD93', '#17AAA1', '#2077B0', '#2944BF', '#3312CE']);

        // initialize axes
        xAxis = d3.svg.axis().orient("bottom");
        yAxis = d3.svg.axis().orient("left").tickFormat(d3.format("%"));

        // map the data to ethnicity categories
        data.forEach(function(d) {
            neighbs.push({
                name: d.mapname,
                ethn: [['African-American'],['White'],['Hispanic/Latino'],['Asian'],['Other']],
                values: [d['African-American'],d['White'],d['Hispanic/Latino'],d['Asian'],d['Other']],

            });
        });

        // create dropdown for neighborhood names
        select = d3.select(".d3-chart__select-container")
            .append("select")

        select
            .on("change", function(d) {
            var value = d3.select(this).property("value");
            neighbs.forEach(function(d) {
                selectNeighborhood(d, value, svg);
            });
        });

        // map data to dropdown options
        select.selectAll("option")
            .data(neighbs)
            .enter()
            .append("option")
            .attr("value", function(d) { return d.name; })
            .text(function(d) { return d.name; });


        // add svg and chartWrapper elements
        svg = d3.select("div.d3-chart__graph").append("svg");
        chartWrapper = svg.append("g");

        // add x and y axes
        chartWrapper.append("g").attr('id', 'x-axis').attr("class", "x axis");
        chartWrapper.append("g").attr("class", "y axis")
            .append("text")
                .attr('class', 'axis__text')
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Percent");

        // add legend
        legend = chartWrapper.append("g").attr("class", "legend");

        legendItem = legend.selectAll(".legend__item")
            .data(philly.ethn.slice())
            .enter().append("g")
            .attr("class", "legend__item");

        legendItem.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legendItem.append("text")
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });

        // render the chart
        render();
    }

    function render() {
        //get dimensions based on window size
        updateDimensions(window.innerWidth);

        //update x and y scales based on new dimensions
        x0.rangeRoundBands([0, width], .1) // .1 sets padding between each group of bands
        x1.range([0, width]);
        y.range([height, 0]);

        //update svg element width and height
        svg
          .attr('width', width + margin.left)
          .attr('height', height + margin.bottom);
        chartWrapper.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        //update the axis
        xAxis.scale(x0);
        yAxis.scale(y);

        // check if neighborhood has already been selected
        var title;
        if (d3.select(".d3-chart__bar--neighb").empty()) {
            title = 'Choose Neighborhood';
        } else {
            // get innerHTML of neigborhood x-axis
            title = svg.select('#x-axis')
                       .selectAll('text')[0][0]
                       .innerHTML;

            // update neighborhood chart
            neighbs.forEach(function(d) {
                selectNeighborhood(d, title, svg);
            });
        }

        // Map the data to the x1 and y scales
        x0.domain([title,philly.name]);
        x1.domain(philly.values).rangeRoundBands([0, x0.rangeBand()]); // Define the range of the band groups as 0 to x0 range
        y.domain([0, 1]);

        // update position of x axis based on width
        svg.select('.x.axis')
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis); //insert axis into element

        // call y axis
        svg.select('.y.axis')
            .call(yAxis)

        // clear out old philly bar chart (if there is one), and build a new one!
        var bars = svg.select(".d3-chart__bar--philly");
            bars.remove();

        buildBarChart(philly, 'd3-chart__bar--philly', philly.values);

        // update position of legend
        svg.selectAll(".legend__item")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.selectAll("rect")
            .attr("x", width - 18);

        legend.selectAll("text")
            .attr("x", width - 24);
    }

    function updateDimensions(winWidth) {
        margin.top = 5;
        margin.right = 20;
        margin.left = 35;
        margin.bottom = 30;

        width = winWidth - 40 - margin.left; //padding
        //set max-width
        width = width > 600 ? 600 : width;
        height = .8 * width;
    }

    function buildBarChart(dataName, cls, bar) {
        tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d, i) { return '<span>' + (dataName.values[i] * 100).toFixed(2) + '%</span>'; });

        svg.call(tip);

        // Select data append to the x0 group elements
        var chart = chartWrapper.selectAll(".mapname")
                .data(count)
            .enter().append("g")
                .attr("class", cls)
                .attr("transform", function(d) { return "translate(" + x0(dataName.name) + ",0)"; });

        // Create rectangles within 'neighb' and append ethnicity data
        chart.selectAll("rect")
                .data(dataName.values)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("width", x1.rangeBand())
                .attr("x", function(d, i) { return x1(bar[i]); })
                .attr("y", height)
                .style("fill", function(d, i) { return color(bar[i]); })
                .attr("height", 0)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .transition()
                .duration(1800)
                .attr({ y: function (d, i) { return y(dataName.values[i]); },
                        height: function (d, i) { return height - y(dataName.values[i]); }
                })

    }

    function selectNeighborhood(mapname, value, svg) {
        if(mapname.name === value) {
            // Clean up what's already there
            var axis = svg.select(".x");
            axis.remove();
            var bars = svg.select(".d3-chart__bar--neighb");
            bars.remove();

            // Map the data to the x0, x1, and y scales
            x0.domain([mapname.name,philly.name]);
            x1.domain(widthRect).rangeRoundBands([0, x0.rangeBand()]); // Define the range of the band groups as 0 to x0 range
            y.domain([0, 1]);

            // Append a group element to the svg to contain the x axis with neighborhood names
            chartWrapper.append("g")
                .attr('id', 'x-axis')
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis); //insert axis into element

            // Select data from the 'mapname' column and append to the x0 group elements
            buildBarChart(mapname, 'd3-chart__bar--neighb', widthRect);
        }
    }

    return {
        render : render
    }

})(window,d3)

window.addEventListener('resize', Chart.render);
