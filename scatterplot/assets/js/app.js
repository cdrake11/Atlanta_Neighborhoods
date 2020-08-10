var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

 // Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins. 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)

// Append an SVG group
var whiteGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
var blackGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// var scatterxaxis = "pop"

// Read in data file using D3(version 5 version 4 does not use .then)
d3.csv("City_of_Atlanta_Neighborhood.csv").then((chartData) =>{
    console.log(chartData)
    
    // Parse Data 
    chartData.forEach((data)=> {
        data.pop = +data.pop;
        data.white = +data.white;
        data.black = +data.black;
        data.other = +data.other;
        data.asian = +data.asian;
        data.hispanic = +data.hispanic;
        // data.neighborhood = +data.neighborhood
    });

    // Create scale functions for x and why
    // remember logic from Devang: Json and Dictionary are essentially the same thing
    //it has arrays and the arrays has keys and values in order to understand each line of code
    var xLinearScale = d3.scaleLinear()
        .domain([8, d3.max(chartData, d => d.pop)])
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([-2, d3.max(chartData, d => d.white)])
        .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    whiteGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    whiteGroup.append("g")
        .call(leftAxis);

    blackGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    blackGroup.append("g")
        .call(leftAxis);
    
    // Create (white) circles
    var whiteCircles = whiteGroup.selectAll("circle")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.pop))
    .attr("cy", d => yLinearScale(d.white))
    .attr("r", "10")
    .attr("fill", "blue")
    .attr("opacity", ".5");
    
    // Create (black) circles
    var blackCircles = blackGroup.selectAll("circle")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.pop))
    .attr("cy", d => yLinearScale(d.black+d.other+d.hispanic+d.asian))
    .attr("r", "10")
    .attr("fill", "green")
    .attr("opacity", ".5"); 


    // Initialize tooltip... make sure versions are correct.. that was the problem the first time I did this
    var toolTip_white = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
         return (`${d.neighborhood}<br> Population: ${d.pop}<br> demographic: ${d.white}% white`);
        });
    var toolTip_black = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
         return (`${d.neighborhood}<br> Population: ${d.pop}<br> demographic: ${d.black+d.other+d.hispanic+d.asian}% non-white`);
        });

    // Create tooltip in the chart
    whiteCircles.call(toolTip_white);

    // Create event listeners to display and hide the tooltip
    whiteCircles.on("mouseover", function(data) {
        toolTip_white.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
        toolTip_white.hide(data);
        });
    // Create tooltip in the chart
    blackCircles.call(toolTip_black);

    // Create event listeners to display and hide the tooltip
    blackCircles.on("mouseover", function(data) {
        toolTip_black.show(data, this);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
        toolTip_black.hide(data);
        });
  
      // Create axes labels
    whiteGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Demographic");

    whiteGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("class", "axisText")
        .text("Population");
    }).catch(function(error) {
      console.log(error);
});
