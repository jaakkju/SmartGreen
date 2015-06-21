var chart = {

  create: function(el, props, state) {
    var scales = this._scales(props.width, props.height, state.domain);

    var svg = d3.select(el).append("svg")
        .attr("width", props.width + props.margin.left + props.margin.right)
        .attr("height", props.height + props.margin.top + props.margin.bottom)
        // .attr("preserveAspectRatio", "xMinYMin meet")
        // .attr("viewBox", "0 0 " + props.width + props.margin.left + props.margin.right + " " + props.height + props.margin.top + props.margin.bottom)
        // .classed("svg-content-responsive", true)
      .append("g")
        .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");

    svg.append("g")
        .attr("id", "x-axis")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + props.height + ")")
        .call(scales.x.axis);

    svg.append("g")
        .attr("class", "y axis temperature")
        .call(scales.yT.axis)
      .append("text")
        .attr("x", 6)
        .attr("y", -14)
        .attr("dy", ".71em")
        .style("text-anchor", "start")
        .style("fill", "red")
        .text("Temperature (ºC)");

    svg.append("g")
        .attr("class", "y axis humidity")
        .call(scales.yH.axis)
        .attr("transform", "translate(" + props.width + ", 0)")
      .append("text")
        .attr("x", -6)
        .attr("y", -14)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("fill", "steelblue")
        .text("Humidity (%)");

    svg.append("path")
        .attr("id", "path-temperature")
        .attr("class", "line")
        .style("stroke", "red");

    svg.append("path")
        .attr("id", "path-humidity")
        .attr("class", "line")
        .style("stroke", "steelblue");

    this.update(el, props, state);
  },

  update: function(el, props, state) {
    var scales = this._scales(props.width, props.height, state.domain);

    var fi_FI = d3.locale({
      decimal: ",",
      thousands: "\xa0",
      grouping: [3],
      currency: ["", "\xa0€"],
      dateTime: "%A, %-d. %Bta %Y klo %X",
      date: "%-d.%-m.%Y",
      time: "%H:%M:%S",
      periods: ["a.m.", "p.m."],
      days: ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai"],
      shortDays: ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"],
      months: ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
      shortMonths: ["Tammi", "Helmi", "Maalis", "Huhti", "Touko", "Kesä", "Heinä", "Elo", "Syys", "Loka", "Marras", "Joulu"]
    });

    var customTimeFormat = d3.time.format.multi([
      [".%L", function(d) { return d.getMilliseconds(); }],
      [":%S", function(d) { return d.getSeconds(); }],
      ["%I:%M", function(d) { return d.getMinutes(); }],
      ["%I %p", function(d) { return d.getHours(); }],
      ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
      ["%b %d", function(d) { return d.getDate() != 1; }],
      ["%B", function(d) { return d.getMonth(); }],
      ["%Y", function() { return true; }]
    ]);

    scales.x.axis.ticks(8);
//    .tickFormat(customTimeFormat);
//    .tickSize(0)
  //  .tickPadding(8);

    var lineT = d3.svg.line()
        .x(function(d) { return scales.x(d.time); })
        .y(function(d) { return scales.yT(d.tem); });

    var lineH = d3.svg.line()
        .x(function(d) { return scales.x(d.time); })
        .y(function(d) { return scales.yH(d.hum); });

    var svg = d3.select(el).select("svg");

    svg.select("#x-axis")
        .call(scales.x.axis);

    svg.select("#path-temperature")
        .datum((state.data ? state.data : []))
        .attr("d", lineT);

    svg.select("#path-humidity")
        .datum((state.data ? state.data : []))
        .attr("d", lineH);

  },

  destroy: function() {

  },

  _scales: function(width, height, domain) {
    var scales = {};

    scales.x = d3.time.scale()
        .range([0, width]);

    scales.yT = d3.scale.linear()
        .range([height, 0]);

    scales.yH = d3.scale.linear()
        .range([height, 0]);

    scales.x.domain([domain.x.min, domain.x.max]);
    scales.yT.domain([domain.yT.min, domain.yT.max]);
    scales.yH.domain([domain.yH.min, domain.yH.max]);

    scales.x.axis = d3.svg.axis()
        .scale(scales.x)
        .orient("bottom");

    scales.yT.axis = d3.svg.axis()
        .scale(scales.yT)
        .orient("left");

    scales.yH.axis = d3.svg.axis()
        .scale(scales.yH)
        .orient("right");


    return scales;
  }

};

var HumidityDrop = React.createClass({
  drawHumidity: function() {
    var humidity = 0;

    if (this.props.humidity && !isNaN(this.props.humidity)) {
      humidity = this.props.humidity;
    }

    var width = 40,
        height = 50,
        dropletPath = "20,2 36,29 38,35 35,40 30,45 25,47 20,48 15,47 10,45 5,40 2,35 4,29";

    var svg = d3.select("#humidity_visualization").append("svg")
        .attr("width", width)
        .attr("height", height)

    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip-drop")
      .append("polygon")
        .attr("points", dropletPath)
        .attr("transform", "rotate(-180) translate(-" + width + ", 0)");

    svg.append("rect")
        .attr("x", 0)
        .attr("y", -height)
        .attr("width", width)
        .attr("height", height/100 * humidity)
        .attr("clip-path", "url(#clip-drop)")
        .attr("transform", "rotate(-180) translate(-" + width + ", 0)")
        .attr("fill", "lightskyblue");

    svg.append("polygon")
        .attr("points", dropletPath)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round");
  },

  componentDidMount: function() {
    this.drawHumidity();
  },

  componentDidUpdate: function() {
    var width = 40,
        height = 60,
        humidity = 0;

    if (this.props.humidity && !isNaN(this.props.humidity)) {
      humidity = this.props.humidity;
    }

    d3.select("#humidity_visualization rect").attr("height", height/100 * humidity);
  },

  render: function() {
    return (
      <i id="humidity_visualization"></i>
    );
  }
});

var CurrentTemperature = React.createClass({
  render: function() {
    return (
      <div class="col-md-12">
        <div className="panel panel-info text-center">
          <div className="panel-heading">Temperature</div>
          <div className="panel-body current temperature">
            <span id="current_temperature">{ this.props.temperature }</span>ºC
          </div>
        </div>
      </div>
    );
  }
});

var CurrentHumidity = React.createClass({
  render: function() {
    console.log("CurrentHumidity", this.props.humidity);
    return (
      <div class="col-md-12">
        <div className="panel panel-info text-center">
          <div className="panel-heading">Humidity</div>
          <div className="panel-body current humidity">
            <HumidityDrop humidity={ this.props.humidity } />
            <span id="current_humidity">{ this.props.humidity }</span>%
          </div>
        </div>
      </div>
    );
  }
});

var SecondsSince = React.createClass({

  getInitialState: function(){

    // This is called before our render function. The object that is
    // returned is assigned to this.state, so we can use it later.

    return { elapsed: 0 };
  },

  componentDidMount: function(){

    // componentDidMount is called by react when the component
    // has been rendered on the page. We can set the interval here:

    this.timer = setInterval(this.tick, 100);
  },

  componentWillUnmount: function(){

    // This method is called immediately before the component is removed
    // from the page and destroyed. We can clear the interval here:

    clearInterval(this.timer);
  },

  tick: function(){

    // This function is called every 50 ms. It updates the
    // elapsed counter. Calling setState causes the component to be re-rendered

    this.setState({elapsed: new Date() - this.props.start});
  },

  render: function() {
    var time = "-";

//    console.log("foo", this.state.elapsed);

    if (this.props.start) {
  //    seconds = Math.round(this.state.elapsed / 1000);

      var seconds = Math.floor(this.state.elapsed / 1000);
      var days = Math.floor(seconds / 86400);
      var hours = Math.floor((seconds % 86400) / 3600);
      var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
      time = '~';

      if (days > 0) time += (days + " d");
      if (hours > 0) time += (hours + " h ");
      if (minutes >= 0) time += (minutes + " min ");

//      var elapsed = Math.round(this.state.elapsed / 100);

      // This will give a number with one digit after the decimal dot (xx.x):
//      seconds = (elapsed / 10).toFixed(1);

      // Although we return an entire <p> element, react will smartly update
      // only the changed parts, which contain the seconds variable.
    }

    return (
      <div class="col-md-12">
        <div className="panel panel-info text-center">
          <div className="panel-heading">Time since last measurement</div>
          <div className="panel-body current humidity">
            <span className="time-since">{time}</span>
          </div>
        </div>
      </div>
    );
  }
});

var SmartGreenTitle = React.createClass({
  render: function() {
    return (
      <div className="page-header col-xs-12">
        <h1>SmartGreen <small>temperature and humidity sensor</small></h1>
      </div>
    );
  }
});

var MainChart = React.createClass({

  componentDidMount: function() {
    var el = React.findDOMNode(this.refs.chart);
    var props = this.getProps();
    var domain = this.getDomain();

    chart.create(el, props, {data: this.props.data, domain: domain});
  },

  componentDidUpdate: function() {
    var el = React.findDOMNode(this.refs.chart);
    var props = this.getProps();
    var domain = this.getDomain();
    chart.update(el, props, {data: this.props.data, domain: domain});
  },

  componentWillUnmount: function() {
    var el = React.findDOMNode(this.refs.chart);
    chart.destroy(el);
  },

  getProps: function() {
    var margin = {top: 30, right: 35, bottom: 30, left: 35};
    return {
      width: 700 - margin.left - margin.right,
      height: 500 - margin.top - margin.bottom,
      margin: margin
    };
  },

  getDomain: function() {
    var minX, maxX;

    if (this.props.end > 0) {
      minX = this.props.start;
      maxX = this.props.end;
    } else if (this.props.data) {
      minX = d3.min(this.props.data, function(d) { return d.time; });
      maxX = d3.max(this.props.data, function(d) { return d.time; });
    } else {
      minX = (new Date()).setHours(0,0,0,0);
      maxX = (new Date()).setHours(24,0,0,0);
    }

    return {
      x: {
        min: minX,
        max: maxX
      },
      yT: {
        min: -10,
        max: 70
      },
      yH: {
        min: 0,
        max: 100
      }
    }
  },

  render: function() {
    return (
      <div className="panel panel-info text-center">
        <div className="panel-heading">Temperature & humidity</div>
          <div className="panel-body">
            <div className="chart" ref="chart"></div>
        </div>
      </div>
    );
  }
});

var DevicePicker = React.createClass({

  selectDevice: function (e) {
    var did = e.target.value;
    actions.setDevice(did);
  },

  render: function() {
    var options = [],
        selectedDID = "";

    console.log(this.props.devices + " " + this.props.currentDID);

    if (this.props.devices) {
      for (var i=0; i<this.props.devices.length; i++) {
        options.push(
          <option key={i} value={this.props.devices[i]}>{this.props.devices[i]}</option>
        );
      }

      selectedDID = this.props.currentDID ? this.props.currentDID : this.props.devices[0];
    }

    console.log("", this.props.currentDID, selectedDID);

    return (
      <div className="form-horizontal col-md-6">
        <div className="form-group row">
          <label htmlFor="selectDevice" className="col-md-4 control-label">Device ID:</label>
          <div className="col-md-8">
          <select className="form-control" id="selectDevice" onChange={this.selectDevice} value={selectedDID}>
            {options}
          </select>
          </div>
        </div>
      </div>
    );
  }

});

var DateTimePicker = React.createClass({

  showAllTime: function() {
    console.log("showAllTime");

    actions.setTimeDomain({
//      start: 0,
//      end: (new Date()).setHours(24,0,0,0),
      allRecords: true
    });
  },

  showMonth: function() {
    // this.setState({
    //   start: Date.now() - (1000 * 60 * 60 * 24 * 31),
    //   end: Date.now()
    // });
    actions.setTimeDomain({
      start: Date.now() - (1000 * 60 * 60 * 24 * 31),
      end: Date.now()
    });
  },

  showWeek: function() {
    actions.setTimeDomain({
      start: Date.now() - (1000 * 60 * 60 * 24 * 7),
      end: Date.now()
    });
  },

  showDay: function() {
    actions.setTimeDomain({
      start: Date.now() - (1000 * 60 * 60 * 24),
      end: Date.now()
    });
  },

  showToday: function() {
    console.log("showToday");

    actions.setTimeDomain({
      start: (new Date()).setHours(0,0,0,0),
      end: (new Date()).setHours(24,0,0,0)
    });
  },

  showRange: function() {
//    console.log("showRange", React.findDOMNode(this.refs.startTime).value, React.findDOMNode(this.refs.endTime).value);
    console.log("showRange", React.findDOMNode(this.refs.startTime).value, React.findDOMNode(this.refs.endTime).value);
    console.log(React.findDOMNode(this.refs.startTime).value);
    console.log(React.findDOMNode(this.refs.endTime).value);

    actions.setTimeDomain({
      start: new Date(React.findDOMNode(this.refs.startTime).value),
      end: new Date(React.findDOMNode(this.refs.endTime).value)
    });
  },

  render: function() {

    var start = "",
        end = "";

    var currentDate = new Date();

    // Find the current time zone's offset in milliseconds.
    var timezoneOffset = currentDate.getTimezoneOffset() * 60 * 1000;

    if (this.props.start) {

      var globalStart = new Date(this.props.start);
      globalStart.setMilliseconds(0);
      // Subtract the time zone offset from the current UTC date, and pass
      //  that into the Date constructor to get a date whose UTC date/time is
      //  adjusted by timezoneOffset for display purposes.
      var localStart = new Date(globalStart.getTime() - timezoneOffset);

      start = localStart.toISOString().replace('Z', '');
    }

    if (this.props.end) {
      var globalEnd = new Date(this.props.end);
      globalEnd.setMilliseconds(0);
      var localEnd = new Date(globalEnd.getTime() - timezoneOffset);
      end = localEnd.toISOString().replace('Z', '');
    }

    console.log("DateTimePicker", start, end);

    return (
      <ul className="col-md-4 pull-right">
        <li><button type="button" className="btn btn-default btn-sm" onClick={this.showAllTime}>All records</button></li>
        <li><button type="button" className="btn btn-default btn-sm" onClick={this.showMonth}>1M</button></li>
        <li><button type="button" className="btn btn-default btn-sm" onClick={this.showWeek}>1W</button></li>
        <li><button type="button" className="btn btn-default btn-sm" onClick={this.showDay}>1D</button></li>
        <li><button type="button" className="btn btn-default btn-sm" onClick={this.showToday}>Today</button></li>
        <li style={{display: "none"}}>
          <input type="datetime-local" id="startTime" ref="startTime" value={start}></input> -
          <input type="datetime-local" id="endTime" ref="endTime" value={end}></input>
          <button type="button" className="btn btn-default btn-sm" onClick={this.showRange}>Refresh</button>
        </li>
      </ul>
    );
  }

});

var SmartGreen = React.createClass({

//  getInitialState: function() {
//    this.getDevices();

//    return {
//      start: d3.min(this.props.data, function(d) { return d.time; }),
//      end: d3.max(this.props.data, function(d) { return d.time; })
//    }
//  },

  componentWillMount: function() {
//    this.calculateCurrentValues();
  },

  componentWillUpdate: function() {
//    this.calculateCurrentValues();
  },

  calculateCurrentValues: function() {
  },


  getDevices: function() {
/*    var self = this;

    d3.json(url, function(error, data) {
      if (error) return console.warn(error);

        self.setState({devices: data});
    });*/
  },

  render: function() {
    // var lastItem = this.props.data.reduce(function(prev, current) {
    //   if (prev.time > current.time) {
    //     return prev;
    //   } else {
    //     return current;
    //   }
    // });

    var currentTemperature = this.props.data && this.props.data.length > 0 ? this.props.data[this.props.data.length - 1].tem : "-",
        currentHumidity = this.props.data && this.props.data.length > 0 ? this.props.data[this.props.data.length - 1].hum : "-",
        currentTime = this.props.data && this.props.data.length > 0 ? this.props.data[this.props.data.length - 1].time : false;

    console.log("SmartGreen", this.props.start, this.props.end);

    return (
      <div className="row">
        <SmartGreenTitle />

        <div className="col-md-12">
          <DevicePicker devices={this.props.devices} currentDID={this.props.currentDID} />
          <DateTimePicker start={this.props.start} end={this.props.end} />
        </div>

        <div className="col-md-8">
          <MainChart data={this.props.data} start={this.props.start} end={this.props.end} />
        </div>
        <div className="col-md-4 row">
          <CurrentTemperature temperature={currentTemperature} />
          <CurrentHumidity humidity={currentHumidity} />
          <SecondsSince start={currentTime} />
        </div>
      </div>
    );
  }

});

var actions = Reflux.createActions([
    "setTimeDomain",
    "setDevice",
    "refreshDevices"
]);

var dataStore = Reflux.createStore({

  init: function() {
    this.listenToMany(actions);

    this.fetchDevices(true);
  },

  fetchDevices: function(switchCurrent) {
    var self = this;

    var url = '/api/register';

    d3.json(url, function(error, data) {
      if (error) return console.warn(error);

      var devices = data.map(function(d) {
        return d.did;
      })

      self.devices = devices;

      if (switchCurrent) {
        self.currentDID = devices[0];
      }

      console.log(self.devices + " " + self.currentDID);

      self.updateData();
    });
  },

  showDevice: function() {
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
    }

    this.drawSmartGreen();
    this.refreshTimer = window.setTimeout(this.drawSmartGreen(), 1000 * 60);
  },

  onSetTimeDomain: function(domain) {
    console.log("onSetTimeDomain");

    if (this.allRecords) {
      this.start = d3.min(this.data, function(d) { return d.time; });
      this.end = d3.max(this.data, function(d) { return d.time; });
    } else {
      this.start = domain.start;
      this.end = domain.end;
    }

    this.showDevice();
  },

  onSetDevice: function(did) {
    this.currentDID = did;
    this.updateData();
  },

  onRefreshDevices: function() {
    this.fetchDevices(false);
  },

  drawSmartGreen: function() {
    React.render(
      <SmartGreen devices={this.devices} currentDID={this.currentDID} data={this.data} start={this.start} end={this.end} />,
      document.getElementById('smartgreen')
    );
  },

  updateData: function() {
    console.log("dataStore.updateData", this.currentDID);

    var self = this;
    var from = new Date();
    var to = new Date();

    from.setHours(0,0,0,0);
    to.setHours(24,0,0,0);

  //  var did = 'z70SyZBcQjufKLOZtgPW';

    var url = '/api/data?did=' + this.currentDID + '&from=' + 0 + '&to=' + to;

    console.log("updating data from url:", url);

    d3.json(url, function(error, data) {
      if (error) return console.warn(error);

      data.forEach(function(d) {
        d.time = new Date(d.time);
        d.hum = +d.hum;
        d.hin = +d.hin;
      });

      self.data = data;

      console.log(data);

      self.showDevice();

    });
  }

});
