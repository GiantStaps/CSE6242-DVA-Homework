const games = ['Catan', 'Dominion', 'Codenames', 'Terraforming Mars', 'Gloomhaven', 'Magic: The Gathering', 'Dixit', 'Monopoly'];

// Declare global variables to store the transformed data so we can access it from console
var dates = [];
var gamestats = {
    count: {},
    rank: {}
};
var maxCount = 0;
var foobar; // for debugging

// Load data
d3.csv("boardgame_ratings.csv").then(function (data) {

    games.forEach(function (game) {
        gamestats.count[game] = [];
        gamestats.rank[game] = [];
    });

    // Iterate over each row in the data to extract dates, counts, and ranks
    data.forEach(function (d) {

        // Parse and store the date
        let date = d3.timeParse("%Y-%m-%d")(d.date);
        dates.push(date);

        // Store count and rank for each game
        games.forEach(function (game) {
            let game_count = +d[`${game}=count`]
            let game_rank = +d[`${game}=rank`]
            gamestats.count[game].push(game_count);
            gamestats.rank[game].push(game_rank);
            maxCount = Math.max(maxCount, game_count);
        });
    });

    // Define the margins
    const margin = { top: 50, right: 150, bottom: 60, left: 80 },
        width = 900,
        height = 500;

    // Define x-scale
    const x = d3.scaleTime()
        .domain(d3.extent(dates))
        .range([margin.left, width - margin.right]);

    // Define y-scale
    const y = d3.scaleLinear()
        .domain([0, maxCount])
        .range([height - margin.bottom, margin.top]);

    // get tickValues. Will be useful later.
    const tickValues = x.ticks(d3.timeMonth.every(3));
    const tickTimestamps = tickValues.map(date => date.getTime());
    const tickIndices = [];
    // get tickIndices for each value.
    for (const [index, date] of dates.entries()) {
        if (tickTimestamps.includes(date.getTime())) {
            tickIndices.push(index);
        }
    };

    // Create a function to add the x-axis
    var xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickValues(tickValues) // Set custom tick values for every 3 months
            .tickFormat(d3.timeFormat("%b %y")));
        
    // Create a function to add the y-axis
    var yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    var xAxisLabel = g => g
        .append("text")
        .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
        .attr("y", height - margin.bottom + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Month");
    
    var yAxisLabel = g => g
        .append("text")
        .attr("x", -(height / 2))
        .attr("y", margin.left - 60)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Num of Ratings");


    // Function to add chart title
    const addChartTitle = g => g
            .append("text")
            .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Number of Ratings 2016-2020");

    // Define a color scale
    var color = d3.scaleOrdinal(d3.schemeCategory10)
                    .domain(games);
    
    // Function to plot lines
    plotLines = function(g) {
        games.forEach(game => {
            const line = d3.line()
                .x((d, i) => x(dates[i]))
                .y(d => y(d));

            g.append("path")
                .datum(gamestats.count[game])
                .attr("fill", "none")
                .attr("stroke", color(game))
                .attr("stroke-width", 2)
                .attr("d", line);
            // add text description to each line
            g.append("text")
                .attr("x", x(dates[dates.length - 1]) + 5) // Set x position slightly to the right of the last point
                .attr("y", y(gamestats.count[game][dates.length - 1])) // Set y position based on the last count value
                .text(game) // Use the game name as the label
                .style("font-size", "12px")
                .attr("fill", color(game)) // Set the text color to match the line color
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "middle");
        })
    }

    plotRank = function(g, trackedGames) {

        trackedGames.forEach(game => {
            // Filter the rankings using the indices of the tick values
            const filteredData = tickIndices.map(index => ({
                date: dates[index],
                rank: gamestats.rank[game][index],
                count: gamestats.count[game][index]
            }));

        // Append circles for the filtered data
        g.append("g")
            .selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.date)) // Position x based on the filtered date
            .attr("cy", d => y(d.count)) // Position y based on the filtered ranking
            .attr("r", 8) // Set radius of the circle
            .attr("fill", color(game));

        g.append("g")
            .selectAll("text")
            .data(filteredData)
            .enter()
            .append("text")
            .attr("x", d => x(d.date))
            .attr("y", d => y(d.count) + 4)
            .text(d => d.rank) // Set the text content as the rank
            .attr("text-anchor", "middle")
            .style("font-size", "9px")
            .attr("fill", "white");
        });
    }

    addLeged = g => g
            .append()
    
    // Begins!! -------------------------------------------------------------------------------------------------------------------------------
    // Actual chart building -------------------------------------------
    // Create a function to generate the first chart
    const chart = function(version) {

        // Create an SVG element
        const svg = d3.create("svg")
            .attr("id", "svg-"+version)
            .attr("width", width) 
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);
    
        // Add chart title
        title = svg.append("g")
                    .attr("id", "title-"+version)
                    .call(addChartTitle);

        // add overarching plot element
        plot = svg.append("g")
                .attr("id", "plot-"+version);
        
        // add plot lines
        lines = plot.append("g")
                    .attr("id", "lines-"+version)
                    .call(plotLines);
        
        // Append a group for the x-axis and call the xAxis function
        xAxisPlot = plot.append("g")
                        .attr("id", "x-axis-"+version)
                        .call(xAxis)
                        .call(xAxisLabel);
    
        // Append a group for the y-axis and call the yAxis function
        yAxisPlot = plot.append("g")
                        .attr("id", "y-axis-"+version)
                        .call(yAxis)
                        .call(yAxisLabel);
        
        // moving beyond the first graph
        if (version != "a") {
            // Add circles only for the filtered tick dates for specific tracked games
            const trackedGames = ['Catan', 'Codenames', 'Terraforming Mars', 'Gloomhaven'];
            symbols = plot.append("g")
                            .attr("id", "symbols-"+version)
                            .call(g => plotRank(g, trackedGames));

            legend = svg.append("g")
                        .attr("id", "legend-"+version)
                        .call(addLegend);
        }

        // Return the SVG node so it can be appended to the DOM
        return svg.node();
    };

        
    // Append the SVG to the body of the document to display the chart
    document.body.append(chart("a"));
    document.body.append(chart("b"));
    document.body.append(chart("c-1"));
    document.body.append(chart("c-2"));
});