/* jshint esversion: 6 */
(function () {
  'use strict';
}());

(function() {

  let data = ""; // keep data in global scope
  let svgContainer = ""; // keep SVG reference in global scope
  let clickState = 'none'; // State variable

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 500);

    // Yellow background
    svgContainer.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 1000)
      .attr('height', 500)
      .attr('fill', '#ffec73');

    d3.csv('d3Viz2/data/SeasonsSimpsonsData.csv')
      .then((csvData) => makeScatterPlot(csvData));
  };

  // make scatter plot
  function makeScatterPlot(csvData) {
    data = csvData;

    // White chart background
    svgContainer.append('rect')
      .attr('x', 50)
      .attr('y', 50)
      .attr('width', 901)
      .attr('height', 400)
      .attr('fill', '#f7f7f7')
      .on("click", () => keyClickHandler('none'));

    // get an array of gre scores and an array of chance of admit
    let greScores = data.map((row) => parseInt(row.Year));
    let admissionRates = data.map((row) => parseFloat(row.AvgViewers));

    let axesLimits = findMinMax(greScores, admissionRates);

    let mapFunctions = drawTicks(axesLimits);

    makeLabels();

    plotData(mapFunctions);

    drawAvgLine(mapFunctions);

    drawKey();
  }

  // make title and axes labels
  function makeLabels() {
    // Title Background
    svgContainer.append('rect')
        .attr('x', 5)
        .attr('y', 20)
        .attr('width', 946)
        .attr('height', 28)
        .attr('fill', '#6aade4');

    // Title
    svgContainer.append('text')
      .attr('x', 10)
      .attr('y', 40)
      .style('font-size', '14pt')
      .style('font-style', 'italic')
      .style('fill', '#fff')
      .text("Average Viewership By Season");

    // Y-Axis Labels
    svgContainer.append('text')
      .attr('transform', 'translate(15, 330)rotate(-90)')
      .style('font-size', '9pt')
      .style('font-weight', 'bold')
      .style('fill', '#555')
      .text('Avg. Viewers (in millions)');
  }

  // plot all the data points on the SVG
  function plotData(map) {
    let xMap = map.x;
    let yMap = map.y;

    // Div to hold tooltip
    let div = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // Draw bar on chart
    svgContainer.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
        .attr('x', (x) => xMap(x) - 14)
        .attr('y', (x) => yMap(x))
        .attr('width', 28)
        .attr('height', (x) => 450 - yMap(x))
        .attr('stroke', '#000')
        .attr('stroke-width', '0.5')
        .attr('fill', (x) => ((x.Data == 'Estimated')? '#8f8782':'#6aade4'))
        .attr('class', (x) => ((x.Data == 'Estimated')? 'estimated':'actual'))
        .attr('id', (x) => ('_' + x.Season))
        .style('cursor', 'pointer')
        .on("click", (d) => keyClickHandler('_' + d.Season))
        .on("mouseover", function(d) {
          d3.select(this).attr('stroke-width', '1.5');
          div.html(
              '<span class="season">Season #' + d.Season + '</span>' +
              '<table style="width:100%">' +
              '<tr><td class="dataName">Year:</td><td class="dataValue">' + d.Year + '</td></tr>' +
              '<tr><td class="dataName">Episodes:</td><td class="dataValue">' + d.Episodes + '</td></tr>' +
              '<tr><td class="dataName">Avg. Viewers (mil):</td><td class="dataValue">' + d.AvgViewers + '</td></tr>' +
              '<tr><td class="dataName">&nbsp;</td><td class="dataValue"></td></tr>' +
              '<tr><td class="dataName">Most Watched Episode:</td><td class="dataValue">' + d.MostWatchedEpisode + '</td></tr>' +
              '<tr><td class="dataName">Viewers (mil):</td><td class="dataValue">' + d.Viewers + '</td></tr>' +
              '</table>'
            )
            .style("left", leftWithinContainer(d3.event.pageX))
            .style("top", (d3.event.pageY + 5) + "px");
          div.style("opacity", 1);
        })
        .on("mousemove", function() {
          div
            .style("left", leftWithinContainer(d3.event.pageX))
            .style("top", (d3.event.pageY + 5) + "px");
        })
        .on("mouseout", function() {
          div.style("opacity", 0);
          if (this.id != clickState) {
            d3.select(this).attr('stroke-width', '0.5');
          }
        });

    // Draw bar label
    svgContainer.selectAll('.text')
      .data(data)
      .enter()
      .append('text')
        .attr('x', x => xMap(x) - 14)
        .attr('y', x => yMap(x) - 5)
        .style('font-size', '7.5pt')
        .style('fill', '#555')
        .style('font-weight', 'bold')
        .text(x => (+x.AvgViewers).toFixed(1))
        .attr('class', x => ((x.Data == 'Estimated') ? 'estimated' : 'actual'))
        .attr('id', x => ('_' + x.Season));
  }

  // Return a pixel position for the tooltip box, taking
  // into account how far to the right the mouse is
  function leftWithinContainer(xPos) {
    if (xPos + 350 > 1000) {
      return 1000 - 350 + "px";
    } else {
      return (xPos) + "px";
    }
  }

  // Draw a line across the plot for the average
  function drawAvgLine(map) {
    let yMap = map.y;
    let sum = data.reduce((total, num) => total + Number(num.AvgViewers), 0);
    let average = sum / data.length;

    // Draw average line
    svgContainer.append('line')
      .attr('x1', 50)
      .attr("y1", yMap(average))
      .attr("x2", 950)
      .attr("y2", yMap(average))
      .attr('stroke', '#acacac')
      .attr('stroke-dasharray', '7,3')
      .attr('stroke-width', 2);

    // Average label background
    svgContainer.append('rect')
        .attr('x', 50)
        .attr('y', yMap(average) - 15)
        .attr('width', 30)
        .attr('height', 15)
        .attr('fill', '#ddd')
        .style("opacity", 0.5);

    // Average label
    svgContainer.append('text')
        .attr('x', 51)
        .attr('y', yMap(average) - 4)
        .style('font-size', '8pt')
        .text(average.toFixed(1));
  }

  // Draw the key for the chart
  function drawKey() {
    // Key title
    svgContainer.append('text')
      .attr('x', 800)
      .attr('y', 75)
      .style('font-size', '9pt')
      .style('font-weight', 'bold')
      .text('Viewership Data');

    // Actual data swatch
    svgContainer.append('rect')
      .attr('x', 800)
      .attr('y', 82)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#6aade4')
      .attr('stroke', '#888')
      .attr('stroke-width', '0.8')
      .style('cursor', 'pointer')
      .on("click", () => keyClickHandler('actual'));

    // Actual data label
    svgContainer.append('text')
      .attr('x', 820)
      .attr('y', 92)
      .style('font-size', '8pt')
      .text('Actual')
      .style('cursor', 'pointer')
      .on("click", () => keyClickHandler('actual'));

    // Estimated data swatch
    svgContainer.append('rect')
      .attr('x', 800)
      .attr('y', 100)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#8f8782')
      .attr('stroke', '#888')
      .attr('stroke-width', '0.8')
      .style('cursor', 'pointer')
      .on("click", () => keyClickHandler('estimated'));

    // Estimated data label
    svgContainer.append('text')
      .attr('x', 820)
      .attr('y', 110)
      .style('font-size', '8pt')
      .text('Estimated')
      .style('cursor', 'pointer')
      .on("click", () => keyClickHandler('estimated'));
  }

  // Handles the making active or inactive parts of the chart
  function keyClickHandler(type) {
    if (type == 'none' || type == clickState) {
      showElements('.actual', true, false);
      showElements('.estimated', true, false);
      clickState = 'none';
      return;
    } else if (type.charAt(0) == '_') {
      showElements('.actual', false, false);
      showElements('.estimated', false, false);
      showElements('#' + type, true, true);
    } else if (type == 'actual') {
      showElements('.actual', true, false);
      showElements('.estimated', false, false);
    } else if (type == 'estimated') {
      showElements('.actual', false, false);
      showElements('.estimated', true, false);
    }

    clickState = type;
  }

  // Applies active/inactive styling to a given element
  function showElements(selector, show, thickBar) {
    d3.selectAll(selector)
      .style("opacity", (show? 1 : 0.25))
      .attr('stroke-width', (thickBar? 1.5 : 0.5));
  }

  // draw the axes and ticks
  function drawTicks(limits) {
    // return gre score from a row of data
    let xValue = function(d) {
      return (typeof d == 'number'? d : +d.Year);
    };

    let xScale = d3.scaleLinear()
                  .domain([limits.greMin - 0.5, limits.greMax + 0.5])
                  .range([50, 950]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    let xAxis = d3.axisBottom()
                .scale(xScale)
                .ticks(data.length)
                .tickFormat(d3.format("d"));

    svgContainer.append('g')
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return Chance of Admit from a row of data
    let yValue = function(d) {
      return (typeof d == 'number'? d : +d.AvgViewers);
    };

    let yScale = d3.scaleLinear()
                  .domain([limits.admitMax + 3, limits.admitMin - 5])
                  .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    let yAxis = d3.axisLeft()
                .scale(yScale)
                .ticks(7);

    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for GRE Scores and Chance of Admit
  function findMinMax(greScores, admissionRates) {

    let greMin = d3.min(greScores);
    let greMax = d3.max(greScores);

    // round x-axis limits
    greMax = Math.round(greMax*10)/10;
    greMin = Math.round(greMin*10)/10;

    let admitMin = d3.min(admissionRates);
    let admitMax = d3.max(admissionRates);

    // round y-axis limits to nearest 0.05
    admitMax = Number((Math.ceil(admitMax*20)/20).toFixed(2));
    admitMin = Number((Math.ceil(admitMin*20)/20).toFixed(2));

    // return formatted min/max data as an object
    return {
      greMin : greMin,
      greMax : greMax,
      admitMin : admitMin,
      admitMax : admitMax
    };
  }

})();