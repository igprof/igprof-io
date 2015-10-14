var Table = Reactable.Table;
var Router = ReactRouter;
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var RouteHandler = Router.RouteHandler;

var FileSelector = React.createClass({
  getInitialState: function() {
      return {
        files: [],
      };
  },
  componentDidMount: function() {
    $.get("profile", function(result) {
      if (!this.isMounted())
        return;
      this.setState({
          files: result,
      });
    }.bind(this));
  },
  render: function() {
    var dataRows = [];
    var rows = [];
    for (var i in this.state.files) {
      dataRows[i] = {url: "#/file/" + this.state.files[i] + "/cumulative",
                 filename: this.state.files[i] };
    }
    for (var i = 0; i < dataRows.length; ++i) {
      rows[i] = {profile: <a href={dataRows[i].url}>{dataRows[i].filename}</a>};
    }
    if (!rows.length)
      return (
      <div><h2>No profiles found in store. Please produce some more.</h2></div>
      );
      
    return (
    <Table className="table table-striped" data={rows} />
    );
  }
});

var NotFound = React.createClass({
  render: function() {
    return (<h1>404</h1>);
  }
});

var CumulativeView = React.createClass({
  getInitialState: function() {
      return {
        main_rows: [],
      };
  },
  componentDidMount: function() {
    $.get("profile/" + this.props.params.splat + "/cumulative",  function(result) {
      if (!this.isMounted())
        return;
      var rows = [];
      var counts_name = "Bytes";
      var hasCalls = true;
      if (this.props.counter == "PERF_TICKS")
      {
        counts_name = "Seconds";
        hasCalls = false;
      }
      for (var i = 0; i < result.length; ++i) {
        url = "#/file/" + this.props.params.splat + "/rank/" + result[i].id;
        rows[i] = {"Symbol name": <a href={url}>{result[i].name}</a>};
        rows[i][counts_name] = result[i].cumulative_count * this.props.period;
        if(hasCalls)
          rows[i]["Calls"] = result[i].total_calls;
      }
      this.setState({
          main_rows: rows,
      });
    }.bind(this));
  },
  render: function() {
    var self_url = "#/file/" + this.props.params.splat + "/self";
    return (
      <div>
        <div><a href={self_url}>Switch to self view.</a></div>
        <Table className="table table-condensed" data={this.state.main_rows} />
      </div>
    );
  }
});

// View for the case we show rows sorted by self contribution.
var SelfView = React.createClass({
  getInitialState: function() {
      return {
        main_rows: [],
      };
  },
  componentDidMount: function() {
    $.get("profile/" + this.props.params.splat + "/self",  function(result) {
      if (!this.isMounted())
        return;
      var rows = [];
      var counts_name = "Bytes";
      var hasCalls = true;
      if (this.props.counter == "PERF_TICKS")
      {
        counts_name = "Seconds";
        hasCalls = false;
      }
      for (var i = 0; i < result.length; ++i) {
        url = "#/file/" + this.props.params.splat + "/rank/" + result[i].id;
        rows[i] = {"Symbol name": <a href={url}>{result[i].name}</a>};
        rows[i][counts_name] = result[i].self_count * this.props.period;
        if(hasCalls)
          rows[i]["Calls"] = result[i].self_calls;
      }
      this.setState({
          main_rows: rows,
      });
    }.bind(this));
  },
  render: function() {
    var cumulative_url = "#/file/" + this.props.params.splat + "/cumulative"
    return (
      <div>
        <div><a href={cumulative_url}>Switch to cumulative view.</a></div>
        <Table className="table table-condensed" data={this.state.main_rows} />
      </div>
    );
  }
});

var ParentsView = React.createClass({
  getInitialState: function() {
    return {
      rows: [],
    };
  },
  refetchData: function(props) {
    $.get("profile/" + props.file + "/" + props.rank + "/parents",  function(result) {
      if (!this.isMounted())
        return;
      var rows = [];
      for (var i = 0; i < result.length; ++i) {
        var r = result[i];
        url = "#/file/" + props.file + "/rank/" + result[i].self_id;
        rows[i] = {Callers: <a href={url}>{r.name}</a>,
                   "%": r.pct,
                   Counts: <span>{r.to_child_count} / {r.cumulative_count}</span>,
                   Calls: <span>{r.to_child_calls} / {r.total_calls}</span>,
                   Paths: <span>{r.to_child_paths} / {r.total_paths}</span>,
        };
      }
      this.setState({
          rows: rows,
      });
    }.bind(this));
  },
  componentWillReceiveProps: function(nextProps) {
    this.refetchData(nextProps);
  },
  componentDidMount: function() {
    this.refetchData(this.props);
  },
  render: function() {
    return (
     <Table className="table table-condensed table-hover" data={this.state.rows} />
    );
  }
});

var ChildrenView = React.createClass({
  getInitialState: function() {
    return {
      rows: [],
    };
  },
  refetchData: function (props) {
    $.get("profile/" + props.file + "/" + props.rank + "/children",  function(result) {
      if (!this.isMounted())
        return;
      var rows = [];
      for (var i = 0; i < result.length; ++i) {
        var r = result[i];
        url = "#/file/" + props.file + "/rank/" + r.self_id;
        rows[i] = {Children: <a href={url}>{r.name}</a>,
                   "%": r.pct,
                   Counts: <span>{r.from_parent_count} / {r.cumulative_count}</span>,
                   Calls: <span>{r.from_parent_calls} / {r.total_calls}</span>,
                   Paths: <span>{r.from_parent_paths} / {r.total_paths}</span>,
        };
      }
      this.setState({
          rows: rows,
      });
    }.bind(this));
  },
  componentWillReceiveProps: function(nextProps) {
    this.refetchData(nextProps);
  },
  componentDidMount: function() {
    this.refetchData(this.props);
  },
  render: function() {
    return (
     <Table className="table table-condensed table-hover" data={this.state.rows} />
    );
  }
});

var MainView = React.createClass({
  getInitialState: function() {
    return {
      rows: [],
    };
  },
  refetchData: function(props) {
    $.get("profile/" + props.file + "/" + props.rank + "/main",  function(result) {
      if (!this.isMounted())
        return;
      var rows = [];

      for (var i = 0; i < result.length; ++i) {
        var r = result[i];

        rows[i] = {Symbol: r.name,
                   "%": r.pct,
                   Counts: <span>{r.self_count} / {r.cumulative_count}</span>,
                   Calls: <span>{r.self_calls} / {r.total_calls}</span>,
                   Paths: <span>{r.self_paths} / {r.total_paths}</span>,
        };
      }
      this.setState({
          rows: rows,
      });
    }.bind(this));
  },
  componentWillReceiveProps: function(nextProps) {
    this.refetchData(nextProps);
  },
  componentDidMount: function() {
    this.refetchData(this.props);
  },
  render: function() {
    return (
     <Table className="table" data={this.state.rows} />
    );
  }
});

var RankView = React.createClass({
  getInitialState: function() {
    return {
      rank: undefined,
    };
  },
  componentWillReceiveProps: function(nextProps) {
  },
  componentDidMount: function() {
    this.setState({
      rank: this.props.params.rank,
      file: this.props.params.splat
    });
  },
  render: function() {
    var cumulative_url = "#/file/" + this.props.params.splat + "/cumulative"
    return (
      <div>
        <div>
          <a href={cumulative_url}>Back to cumulative view.</a>
          <ParentsView rank={this.props.params.rank} file={this.props.params.splat} />
          <MainView rank={this.props.params.rank} file={this.props.params.splat} />
          <ChildrenView rank={this.props.params.rank} file={this.props.params.splat} />
        </div>
      </div>
    );
  }
});

var App = React.createClass({
  render: function() {
    return (
      <div class="container">
        <h1>IgProf</h1>
        <RouteHandler/>
      </div>
    );
  }
});

var FileView = React.createClass({
  getInitialState: function() {
      return {
        filename: [],
        period: 1,
        counter: "UNKNOWN",
        counts: 0,
        calls: 0,
      };
  },
  refetchData: function(props) {
    $.get("profile/" + props.params.splat,  function(result) {
      if (!this.isMounted())
        return;
      console.log(result);
      this.setState({
        filename: props.params.splat,
        period: result.tick_period || 1,
        counter: result.counter,
        counts: result.total_count,
        calls: result.total_freqs
      });
    }.bind(this));
  },
  componentWillReceiveProps: function(nextProps) {
    this.refetchData(nextProps);
  },
  componentDidMount: function() {
    this.refetchData(this.props);
  },
  render: function() {
    return (
      <div class="container">
        File: {this.props.params.splat} - Counter: {this.state.counter}<br/>
        <a href="#/">Back to file directory.</a>
        <RouteHandler counter={this.state.counter} period={this.state.period}/>
      </div>
    );
  }
});

var routes = (
  <Route handler={App}>
    <Route handler={FileSelector} path="/"/>
    <Route handler={FileView} path="/file">
      <Route handler={CumulativeView} path="*/cumulative"/>
      <Route handler={SelfView} path="*/self"/>
      <Route handler={RankView} path="*/rank/:rank"/>
    </Route>
    <Route handler={NotFound} path="*"/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById("content"));
});

Router.run(routes, Router.HashLocation, function (Handler) {
  React.render(<Handler/>, document.getElementById("content"));
});
