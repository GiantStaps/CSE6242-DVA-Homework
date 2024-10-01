// Function to read data and return a Promise that resolves with the data and maxRating
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

// Line Chart function
function createLineChart(data, maxRating, yearInterested, margin, width, height) {

    let yearDict = {};
    let maxSumCounts = 0;
    const rangeArray = Array.from({ length: maxRating + 1 }, (_, i) => i);
    yearInterested.forEach(year => {
        // Filter data for the current year
        const filteredYearData = data.filter(d => d.year === year);
    
        // Sum the counts for ratings within the range
        const sumCountsByRating = rangeArray.map(rating => {
            const sum = filteredYearData
                .filter(d => d.rating === rating)   // Filter by the specific rating
                .reduce((sum, d) => sum + d.count, 0);  // Sum up the `count` for that rating
            
            maxSumCounts = Math.max(maxSumCounts, sum);    
            return sum;
        });
    
        // Set the object for the current year in yearDict
        yearDict[year] = {
            sumCounts: sumCountsByRating,
            details: filteredYearData
        };
    });

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
        .call(d3.axisLeft(y));

    const xAxisLabel = g => g
        .append("text")
        .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
        .attr("y", height - margin.bottom + 40)
        .attr("class", "label")
        .text("Month");

    const yAxisLabel = g => g
        .append("text")
        .attr("x", -(height / 2))
        .attr("y", margin.left - 60)
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .text("Num of Ratings");
    
    let line = d3.line()
        .x((d, i) => x(i))
        .y(d => y(d));

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10); // A color scale with distinct colors

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
                    .attr("r", 3) // Set the radius of the circle
                    .attr("fill", colorScale(index)); // Assign a color based on the index, matching the line color
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
                .text("Board games by Rating 2015-2019");

    const credit = g => g
                .append("text")
                .attr("x", width / 2.3)
                .attr("y", 20)
                .attr("class", "rank")
                .text("rma86");

    const legend = g => g
                .append

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
        
        let legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(${width}, ${margin.top + 50})`); // Position legend above the chart
        
        container.call(xAxisLabel)
                .call(yAxisLabel);
        
        plot_lines_and_legends(lines, circles, legend);
    }
    plotChart();

    return {

    };
}

async function main() {
    // Load data and maxRating first
    const pathToCsv = "./average-rating.csv";
    const { data, maxRating } = await loadData(pathToCsv);

    // Define parameters for the chart
    const yearInterested = [2015, 2016, 2017, 2018, 2019];
    const margin = { top: 50, right: 150, bottom: 60, left: 80 };
    const width = 900;
    const height = 600;

    // Now call createLineChart with loaded data
    createLineChart(data, maxRating, yearInterested, margin, width, height);
}

main();