import * as d3 from 'd3';
import { xScale, yScale, renderXAxis, renderYAxis, renderCircles, updateToolTip, createXAxisLabel, createYAxisLabel, renderCirclesText } from './utils';
import { axisLabels, svgHeight, svgWidth, margin, chartHeight, chartWidth } from './constants';

export const drawScatterPlot = (csvData) => {

  // Choose the initial x-axis and y-axis to display.
  let chosenXAxis = axisLabels.poverty;
  let chosenYAxis = axisLabels.healthcare;

  // Create an SVG wrapper, append an SVG group that will hold the chart,
  // and shift the latter by left and top margins.
  const svg = d3.select("#scatter")
    .append("svg")
    .attr("class", "svg")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
  // using viewBox is what makes the svg/chart responsive:
  // https://medium.com/@louisemoxy/a-simple-way-to-make-d3-js-charts-svgs-responsive-7afb04bc2e4b


  // Append an SVG group.
  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Retrieve data from the CSV file and execute everything below.
  d3.csv(csvData).then(function(data, err) {
    if (err) throw err;

    // Parse data/cast as numbers.
    data.forEach((data) => {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
      data.age = +data.age;
      data.income = +data.income;
    });

    // Create scale functions.
    let xLinearScale = xScale(data, chosenXAxis, chartWidth);
    let yLinearScale = yScale(data, chosenYAxis, chartHeight);

    // Create initial axis functions.
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to the chart.
    let xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    let yAxis = chartGroup.append("g")
      .call(leftAxis);

    let circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "15")
      .attr("fill", "blue")
      .attr("opacity", ".5")

    let circlesText = chartGroup.selectAll("text.text-circles")
     .data(data)
     .enter()
     .append("text")
     .classed("text-circles",true)
     .text(d => d.abbr)
     .attr("x", d => xLinearScale(d[chosenXAxis]))
     .attr("y", d => yLinearScale(d[chosenYAxis]))
     .attr("dy",5)
     .attr("text-anchor","middle")
     .attr("font-size","10px")


    // Create group for x-axis labels.
    const xaxisLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    // Create the x-axis labels.
    const zipcodeLabel = createXAxisLabel(xaxisLabelsGroup, 20, axisLabels.poverty, "active", true, "Zip Code In Atlanta (%)");
    const median_listingLabel = createXAxisLabel(xaxisLabelsGroup, 40, axisLabels.age, "inactive", true, "Listing Price (Median)");
    const incomeLabel = createXAxisLabel(xaxisLabelsGroup, 60, axisLabels.income, "inactive", true, "Household Income (Median)");

    // Create group for y-axis labels.
    const yaxisLabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")

    // Create the y-axis labels.
    const healthcareLabel = createYAxisLabel(yaxisLabelsGroup, margin, 125, chartHeight, axisLabels.healthcare, "active", true, "Zip Code In Atlanta");
    const obesityLabel = createYAxisLabel(yaxisLabelsGroup, margin, 100, chartHeight, axisLabels.obesity, "inactive", true, "Obese (%)");
    const smokesLabel = createYAxisLabel(yaxisLabelsGroup, margin, 75, chartHeight, axisLabels.smokes, "inactive", true, "Smokes (%)");

    // Create/update tooltip for each circle in the circles group.
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


    // Event listener for when an x-axis label is clicked.
    xaxisLabelsGroup.selectAll("text")
      .on("click", function() {
        // Get value of selection.
        const value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // Replaces chosenXAxis with value.
          chosenXAxis = value;

          // Updates x scale for new data.
          xLinearScale = xScale(data, chosenXAxis, chartWidth);

          // Updates x-axis with transition.
          xAxis = renderXAxis(xLinearScale, xAxis);

          // updates circles with new x values.
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // Updates circles text.
          circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // Updates tooltips with new info.
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // Changes classes to change bold text.
          switch(chosenXAxis) {
            case axisLabels.income:
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            break;
            case axisLabels.poverty:
              povertyLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
              break;
            case axisLabels.age:
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
              break;
            default:
              povertyLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
          }
        }
      });

      // Event listener for when y-axis label is clicked.
      yaxisLabelsGroup.selectAll("text")
        .on("click", function() {
          // Get value of selection.
          const value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {

            // Replaces chosenYAxis with value.
            chosenYAxis = value;

            // Updates y scale for new data.
            yLinearScale = yScale(data, chosenYAxis, chartHeight);

            // Updates x-axis with transition.
            yAxis = renderYAxis(yLinearScale, yAxis);

            // Updates circles with new x values.
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Updates tooltips with new info.
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Updates circles text.
            circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // Change classes to change bold text for y-axis labels.
            switch(chosenYAxis) {
              case axisLabels.healthcare:
                healthcareLabel
                  .classed("active", true)
                  .classed("inactive", false);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                break;
              case axisLabels.obesity:
                healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                break;
              case axisLabels.smokes:
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", true)
                  .classed("inactive", false);
                break;
              default:
                healthcareLabel
                  .classed("active", true)
                  .classed("inactive", false);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
            }
          }
        });
  }).catch((error) => console.log(error));
}

// Event listener for window resize.
// When the browser window is resized, drawScatterPlot() is called.
d3.select(window).on("resize", drawScatterPlot);
