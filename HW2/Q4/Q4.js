// define the dimensions and margins for the line chart
// Use the Margin Convention referenced in the HW document to layout your graph
const margin = { top: 50, right: 150, bottom: 60, left: 80 }, 
    width = 600,
    height = 300;

// define the dimensions and margins for the bar chart


// append svg element to the body of the page
// set dimensions and position of the svg element
let svg = d3
    .select("body")
    .append("svg")
    .attr("id", "line_chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "container")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Fetch the data
var pathToCsv = "./average-rating.csv";
var yearInterested = [2015, 2016, 2017, 2018, 2019];
const yearDict = {};
var maxRating = 0;
var maxSumCounts = 0;

d3.dsv(",", pathToCsv, function (d) {

    // Get unique occurances of ratings
    let rating = Math.floor(+d.average_rating);
    maxRating = Math.max(maxRating, rating);

    return {
        // format data attributes if required
        name: d.name,
        year: +d.year,
        rating: rating,
        count: +d.users_rated
    }
}).then(function (data) {

    const rangeArray = Array.from({ length: maxRating }, (_, i) => i);
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
    x = d3.scaleLinear()
            .domain([0, maxRating])
            .range([margin.left, width - margin.right]);
    y = d3.scaleLinear()
            .domain([0, maxSumCounts])
            .range([height - margin.bottom, margin.top]);

    /* Create bar plot using data from csv */



}).catch(function (error) {
    console.log(error);
});

