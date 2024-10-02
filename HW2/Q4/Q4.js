// Function to read data and return a Promise that resolves with the data and maxRating
let colorScale = d3.scaleOrdinal(d3.schemeCategory10); // A color scale with distinct colors
function loadData(pathToCsv) {
    let maxRating = 0; // Initialize maxRating

    return d3.dsv(",", pathToCsv, function (d) {
        // Get unique occurrences of ratings
        let rating = Math.floor(+d.average_rating);
        maxRating = Math.max(maxRating, rating); // Update maxRating

        return {
            name: d.name,
            year: +d.year,
            rating: rating,
            count: +d.users_rated
        };
    }).then(function (data) {
        // Return both data and maxRating
        return { data, maxRating };
    });
}

// Function that does analysis on the data
function dataProcessing(data, maxRating, yearInterested) {

    let yearDict = {};
    let maxSumCounts = 0;
    const rantingRange = Array.from({ length: maxRating + 1 }, (_, i) => i);

    yearInterested.forEach(year => {
        // Filter data for the current year
        const filteredYearData = data.filter(d => d.year === year);
        let sums = [];
        let topFiveGames = [];

        // Sum the counts for ratings within the range
        // While also getting top 5 games for each rating
        rantingRange.forEach(rating => {

            const filteredYearRatingData = filteredYearData
                                            .filter(d => d.rating === rating)
            const sum = filteredYearRatingData
                                .reduce((sum, d) => sum + d.count, 0)

            sums.push(sum);

            maxSumCounts = Math.max(maxSumCounts, sum);

            topFiveGames.push(filteredYearRatingData
                            .sort((v1, v2) => d3.descending(v1.count, v2.count))
                            .slice(0, 5)
                            .map(d => ({name: d.name, count: d.count}))
                            .reverse()
                        );
        })

    
        // Set the object for the current year in yearDict
        yearDict[year] = {
            sumCounts: sums,
            topFiveGames: topFiveGames,
            details: filteredYearData
        };
    });
    return {yearDict, maxSumCounts};
}

// Line Chart function
function createLineChart(yearDict, maxRating, maxSumCounts, yearInterested, margin, width, height) {

    // Create scales
    const x = d3.scaleLinear()
                .domain([0, maxRating])
                .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
                .domain([0, maxSumCounts])
                .range([height - margin.bottom, margin.top]);
        
    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
    
    // Create a function to add the y-axis
    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
        .tickFormat(d => d / 1000));

    const xAxisLabel = g => g
        .append("text")
        .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
        .attr("y", height - margin.bottom + 40)
        .attr("class", "label")
        .text("Rating");

    const yAxisLabel = g => g
        .append("text")
        .attr("x", -(height / 2))
        .attr("y", margin.left - 60)
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .text("Count");
    
    let line = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d));

    const plot_lines_and_legends = (lines_g, circles_g, legend_g) => {
        
        // for each year
        yearInterested.forEach((year, index) => {

            // plot the sumCounts
            lines_g.append("path")
                .datum(yearDict[year].sumCounts)
                .attr("fill", "none")
                .attr("stroke", colorScale(index)) // Assign a color based on the index
                .attr("stroke-width", 2)
                .attr("d", line);

            // for each datapoint in the sumCounts array, plot a circle
            yearDict[year].sumCounts.forEach((d, i) => {
                circles_g.append("circle")
                    .attr("cx", x(i)) // Set x position using your x scale
                    .attr("cy", y(d)) // Set y position using your y scale
                    .attr("r", 6) // Set the radius of the circle
                    .attr("fill", colorScale(index)) // Assign a color based on the index, matching the line color
                    .on("mouseover", function(event) {
                        // Update yearRatingData based on the year and index
                        
                        yearRatingData = yearDict[year].topFiveGames[i];
                        if (yearRatingData.length !== 0) {
                            // Create a new title and bar chart with the updated data

                            createBarChartTitle(year, i, margin, width, height);
                            createBarChart(index, yearRatingData, margin, width, height);
                            
                            d3.select("#bar_chart_title").style("display", "block");
                            d3.select("#bar_chart").style("display", "block");
                        }
                    
                        // Optionally, highlight the circle
                        d3.select(this).attr("r", 12); // Increase circle size on hover
                    })
                    .on("mouseout", function() {

                        let bars = d3.select("#bar_chart")
                        .selectAll(".bar")
                        .data([]);
                
                        bars.exit().remove(); // Remove all bars since there is no data bound to them
                
                        // Remove the existing bar chart when mouse moves out
                        d3.select("#bar_chart_title").style("display", "none");
                        d3.select("#bar_chart").style("display", "none");
                    
                        // Reset the circle to its original size
                        d3.select(this).attr("r", 6);
                    });
            });

            legend_g.append("circle")
            .attr("cx", 0) // Keep the circle's x relative to the legend group
            .attr("cy", index * 20) // Space out the circles vertically
            .attr("r", 5)
            .attr("fill", colorScale(index));
    
            // Append text for legend
            legend_g.append("text")
                .attr("x", 10) // Position text to the right of the circle
                .attr("y", index * 20 + 4) // Align text with each circle (4 pixels to align vertically with the circle)
                .text(year)
                .attr("class", "legend");
        });
    }

    const chart_title = g => g
                .append("text")
                .attr("x", width / 2.3 )
                .attr("y", 0)
                .attr("class", "title")
                .attr("id", "line_chart_title")
                .text("Board games by Rating 2015-2019");

    const credit = g => g
                .append("text")
                .attr("x", width / 2.3)
                .attr("y", 20)
                .attr("class", "rank")
                .attr("id", "credit")
                .text("rma86");

    function plotChart() {

        let svg = d3.select("body")
            .append("svg")
            .attr("id", "line_chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
    
        // Append the main container `g` element and apply margins
        let container = svg.append("g")
            .attr("id", "container")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        // Append the group to hold lines
        let lines = container.append("g")
            .attr("id", "lines");
        
        // Append x-axis group and call x-axis function
        let x_axis_lines = container.append("g")
            .attr("id", "x-axis-lines")
            .attr("transform", `translate(0, ${height - margin.bottom})`) // Position at bottom of the chart
            .call(xAxis);
        
        // Append y-axis group and call y-axis function
        let y_axis_lines = container.append("g")
            .attr("id", "y-axis-lines")
            .attr("transform", `translate(0, 0)`) // Default transform for left axis
            .call(yAxis);
        
        let circles = container.append("g")
                            .attr("id", "circles")
        
        container.call(chart_title)
                .call(credit);
        
        let legend = container.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(${width-margin.right/1.5}, ${margin.top})`); // Position legend above the chart
        
        container.call(xAxisLabel)
                .call(yAxisLabel);
        
        plot_lines_and_legends(lines, circles, legend);
    }
    plotChart();
    chart_ready = true;
}

function createBarChartTitle(curr_year, curr_rating, margin, width, height) {
    let title = d3.select("#bar_chart_title")
    if (title.empty()) {
        d3.select("body").append("div")
            .attr("class", "title")
            .attr("id", "bar_chart_title")
            .style("left", (width/2.3 - margin.left) + "px") // Position it based on margin and chart width
            .style("top", margin.top + "px") // Position it based on top margin
            .style("display", "none")
            .text(`Top 5 Most Rated Games of ${curr_year} with Rating ${curr_rating}`);
    } else {
        title.text(`Top 5 Most Rated Games of ${curr_year} with Rating ${curr_rating}`);
    }
}

function createBarChart(curr_year, yearRatingData, margin, width, height) {

    // Create scales
    var x = d3.scaleLinear()
                .domain([0, d3.max(yearRatingData, d => d.count)])
                .range([margin.left, width - margin.right]);

    var y = d3.scaleBand()
                .domain(yearRatingData.map(d => d.name))
                .range([height - margin.bottom, margin.top])
                .padding(0.2);

    // Add bars to the chart
    const addBars = function(g) {
        g.selectAll("rect")
            .data(yearRatingData)
            .enter()
            .append("rect")
            .attr("x", x(0)) // Start each bar at x = 0 (aligned to the zero of the x-axis)
            .attr("y", d => y(d.name)) // Position the bar based on the categorical y scale
            .attr("width", d => x(d.count) - x(0)) // Set the width of each bar based on the count value
            .attr("height", y.bandwidth()) // Use the bandwidth of the y scale for the height of the bar
            .attr("fill", colorScale(curr_year));
    };

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
                .tickSize(-height + margin.top + margin.bottom));
    
    // Create a function to add the y-axis
    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
                .tickFormat(d => d.length > 10 ? d.slice(0, 10) : d)
            );

    const xAxisLabel = g => g
                .append("text")
                .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
                .attr("y", height - margin.bottom + 40)
                .attr("class", "label")
                .attr("id", "bar_x_axis_label")
                .text("Number of Users");

    const yAxisLabel = g => g
                .append("text")
                .attr("x", -(height / 2))
                .attr("y", margin.left - 60)
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("id", "bar_y_axis_label")
                .text("Gmaes");

    const plotChart = () => {
        
        let svg = d3.select("#bar_chart");

        if (svg.empty()) {
            svg = d3.select("body")
                .append("svg")
                .attr("id", "bar_chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style("display", "none");

            let container = svg.append("g")
                .attr("id", "container_2")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
            
            let bars = container.append("g")
                                .attr("id", "bars")
                                .call(addBars);
            
            // Append the group for x-axis
            let xAxisBars = container.append("g")
                .attr("id", "x-axis-bars")
                .call(xAxis);

            // Append the group for y-axis
            let yAxisBars = container.append("g")
                .attr("id", "y-axis-bars")
                .call(yAxis);
            
            container
                .call(xAxisLabel);
            container
                .call(yAxisLabel);
        } else {
            // just do the update
            x.domain([0, d3.max(yearRatingData, d => d.count)]);
            y.domain(yearRatingData.map(d => d.name));
        
            // Update axes with new scales
            svg.select("#x-axis-bars").call(xAxis);
            svg.select("#y-axis-bars").call(yAxis);
        
            // Bind data to bars
            let bars = svg.select("#bars").selectAll("rect").data(yearRatingData);

            // Enter new bars if necessary
            bars.enter()
                .append("rect")
                .attr("class", "bar")
                .merge(bars)
                .attr("x", margin.left)
                .attr("y", d => y(d.name))
                .attr("width", d => x(d.count) - margin.left)
                .attr("height", y.bandwidth())
                .attr("fill", colorScale(curr_year));
        }

    }
    plotChart();
}


async function main() {

    var yearInterested = [2015, 2016, 2017, 2018, 2019];
    // Load data and maxRating first
    const pathToCsv = "./average-rating.csv";
    const { data, maxRating } = await loadData(pathToCsv);
    const { yearDict, maxSumCounts } = dataProcessing(data, maxRating, yearInterested);

    // Define parameters for the chart
    var margin = { top: 50, right: 150, bottom: 60, left: 80 };
    var width = 900;
    var height = 600;
    var curr_year = 2019,
        curr_rating = 6;
    createLineChart(yearDict, maxRating, maxSumCounts, yearInterested, margin, width, height)    
    createBarChartTitle(curr_year, curr_rating, margin, width, height);
    yearRatingData = yearDict[curr_year].topFiveGames[curr_rating];
    createBarChart(curr_year, yearRatingData, margin, width, height);
    return yearDict;
}

let yearDict;
main().then(result => {
    yearDict = result;
});