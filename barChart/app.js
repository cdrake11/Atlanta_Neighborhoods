// Define SVG area dimensions
var svgWidth = 1500;
var svgHeight = 500;

// Define the chart's margins as an object
var chartMargin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// var chartWidth = svgWidth - margin.left - margin.right;
// var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
  .select("body")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Load data from hours-of-tv-watched.csv
d3.csv("MLP.csv").then(function(barData) {

  // Print the tvData
  console.log(barData);

  // Cast the hours value to a number for each piece of tvData
  barData.forEach(function(data) {
  data.Median_Listing_Price = +data.Median_Listing_Price;
  });

  // Configure a band scale for the horizontal axis with a padding of 0.1 (10%)
  var xBandScale = d3.scaleBand()
    .domain(barData.map(d => d.Zip_code))
    .range([0, chartWidth])
    .padding(0.0);

  // Create a linear scale for the vertical axis.
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(barData, d => d.Median_Listing_Price)])
    .range([chartHeight, 0]);

  // Create two new functions passing our scales in as arguments
  // These will be used to create the chart's axes
  var bottomAxis = d3.axisBottom(xBandScale);
  var leftAxis = d3.axisLeft(yLinearScale).ticks(10);

  // Append two SVG group elements to the chartGroup area,
  // and create the bottom and left axes inside of them
  chartGroup.append("g")
    .call(leftAxis);

  chartGroup.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // Create one SVG rectangle per piece of tvData
  // Use the linear and band scales to position each rectangle within the chart
  chartGroup.selectAll(".bar")
    .data(barData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xBandScale(d.Zip_code))
    .attr("y", d => yLinearScale(d.Median_Listing_Price))
    .attr("width", xBandScale.bandwidth())
    .attr("height", d => chartHeight - yLinearScale(d.Median_Listing_Price));


  // Create axes labels
  chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - chartMargin.left + 15)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("($) Median Listing Price");

  chartGroup.append("text")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top + 30})`)
      .attr("class", "axisText")
      .text("Zipcode");
}).catch(function(error) {
  console.log(error);
});
