var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var xScale = d3.time.scale()
    .range([0, width]);

var yScaleLeft = d3.scale.linear()
    .range([height, 0]);

var yScaleRight = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

var yAxisT = d3.svg.axis()
    .scale(yScaleLeft)
    .orient("left");

var yAxisLeft = d3.svg.axis()
    .scale(yScaleRight)
    .orient("right");

var lineTem = d3.svg.line()
    .x(function(d) { return xScale(d.time); })
    .y(function(d) { return yScaleLeft(d.tem); });

var lineHum = d3.svg.line()
    .x(function(d) { return xScale(d.time); })
    .y(function(d) { return yScaleRight(d.hum); });

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* Building query URL */

var from = new Date();
var to = new Date();

from.setHours(0,0,0,0);
to.setHours(24,0,0,0);

var did = 'z70SyZBcQjufKLOZtgPW';
var url = '/api/data?did=' + did + '&from=' + from + '&to=' + to;

d3.json(url, function(error, data) {
  if (error || !data.length) return console.warn(error);

  d3.select(".current_temperature").html("Current temperature: " + data[0].tem);
  d3.select(".current_humidity").html("Current humidity: " + data[0].hum);

  data.forEach(function(d) {
    d.time = new Date(d.time);
  });

  xScale.domain([from, to]);

  yScaleLeft.domain([0, 70]);
  yScaleRight.domain([0, 100]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxisT)
    .append("text")
      .attr("x", 6)
      .attr("y", -14)
      .attr("dy", ".71em")
      .style("text-anchor", "start")
      .style("fill", "steelblue")
      .text("Temperature (ºC)");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxisLeft)
      .attr("transform", "translate(" + width + ", 0)")
      .append("text")
      .attr("x", -6)
      .attr("y", -14)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill", "red")
      .text("Humidity (%)");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .style("stroke", "steelblue")
      .attr("d", lineTem);

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .style("stroke", "red")
      .attr("d", lineHum);
});

/* Merge fail

var mainChart = function () {
  var margin = {top: 20, right: 20, bottom: 30, left: 20},
      width = 700 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.time.scale()
      .range([0, width]);

  var yT = d3.scale.linear()
      .range([height, 0]);

  var yH = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxisT = d3.svg.axis()
      .scale(yT)
      .orient("left");

  var yAxisH = d3.svg.axis()
      .scale(yH)
      .orient("right");

  var lineT = d3.svg.line()
      .x(function(d) { return x(d.time); })
      .y(function(d) { return yT(d.tem); });

  var lineH = d3.svg.line()
      .x(function(d) { return x(d.time); })
      .y(function(d) { return yH(d.hum); });

  var svg = d3.select(".chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("data.json", function(error, data) {
    if (error) return console.warn(error);

    showCurrentValues(data);

    data.forEach(function(d) {
      d.time = new Date(+d.time);
      d.tem = +d.tem;
      d.hum = +d.hum;
      d.hi = +d.hi;
    });

    x.domain(d3.extent(data, function(d) { return d.time; }));
    yT.domain([-10, 70]);
    yH.domain([0, 100]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxisT)
      .append("text")
        .attr("x", 6)
        .attr("y", -14)
        .attr("dy", ".71em")
        .style("text-anchor", "start")
        .style("fill", "red")
        .text("Temperature (ºC)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxisH)
        .attr("transform", "translate(" + width + ", 0)")
      .append("text")
        .attr("x", -6)
        .attr("y", -14)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("fill", "steelblue")
        .text("Humidity (%)");

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .style("stroke", "red")
        .attr("d", lineT);

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .style("stroke", "steelblue")
        .attr("d", lineH);
  });
};

var showCurrentValues = function (data) {
  var lastItem = data.reduce(function(prev, current) {
    if (prev.time > current.time) {
      return prev;
    } else {
      return current;
    }
  });

  humidityVisualization(lastItem.hum);

  d3.select("#current_temperature").html(lastItem.tem);
  d3.select("#current_humidity").html(lastItem.hum);
}

var humidityVisualization = function (humidity) {

  var width = 40,
      height = 60;

  var svg = d3.select("#humidity_visualization").append("svg")
      .attr("width", width)
      .attr("height", height)

  //  .append("rect")
  //     .attr("width", 40)
  //     .attr("height", 60)
  //     .attr("stroke", "steelblue")
  //     .attr("fill", "none");

  svg.append("rect")
      .attr("x", 0)
      .attr("y", -height)
      .attr("width", width)
      .attr("height", height/100 * humidity)
      .attr("transform", "rotate(-180) translate(-" + width + ", 0)")
      .attr("fill", "steelblue");
};

mainChart();
*/
