const games = ['Catan', 'Dominion', 'Codenames', 'Terraforming Mars', 'Gloomhaven', 'Magic: The Gathering', 'Dixit', 'Monopoly'];

// Declare global variables to store the transformed data so we can access it from console
var dates = [];
var gamestats = {
    count: {},
    rank: {}
};
var maxCount = 0;

d3.csv("boardgame_ratings.csv").then(function (data) {
    // Initialize count and rank arrays for each game
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

    console.log("Dates:", dates);
    console.log("Gamestats:", gamestats);
});

var margin = { top: 50, right: 150, bottom: 60, left: 80 },
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

var x = d3.scaleTime()
    .domain(d3.extent(dates))
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0, maxCount])
    .range([height, 0]);

// Create and add the x-axis with a tick for every three months
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x)
        .ticks(d3.timeMonth.every(3)) // Set a tick every 3 months
        .tickFormat(d3.timeFormat("%b %Y"))) // Format the tick labels as 'Month Year'
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

// Create and add the y-axis
svg.append("g")
    .call(d3.axisLeft(y));

// Add the x-axis label
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Month");

// Add the y-axis label
svg.append("text")
    .attr("x", -(height / 2))
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Num of Ratings");

// Add the chart title
svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Number of Ratings 2016-2020");