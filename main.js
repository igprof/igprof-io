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
      dataRows[i] = {url: "#/" + this.state.files[i] + "/cumulative",
                 filename: this.state.files[i] };
    }
    for (var i = 0; i < dataRows.length; ++i) {
      rows[i] = {profile: <a href={dataRows[i].url}>{dataRows[i].filename}</a>};
    }
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
      for (var i = 0; i < result.length; ++i) {
        url = "#/" + this.props.params.splat + "/rank/" + result[i].id;
        rows[i] = {"Symbol name": <a href={url}>{result[i].name}</a>,
                   Counts: result[i].cumulative_count,
                   Calls: result[i].total_calls,
        };
      }
      this.setState({
          main_rows: rows,
      });
    }.bind(this));
  },
  render: function() {
    var self_url = "#/" + this.props.params.splat + "/self";
    return (
      <div>
        File: {this.props.params.splat} <a href="#/">Back to file directory.</a>
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
      for (var i = 0; i < result.length; ++i) {
        url = "#/" + this.props.params.splat + "/rank/" + result[i].id;
        rows[i] = {"Symbol name": <a href={url}>{result[i].name}</a>,
                   ticks: result[i].self_count,
                   calls: result[i].self_calls,
        };
      }
      this.setState({
          main_rows: rows,
      });
    }.bind(this));
  },
  render: function() {
    var cumulative_url = "#/" + this.props.params.splat + "/cumulative"
    return (
      <div>
        File: {this.props.params.splat} <a href="#/">Back to file directory.</a>
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
        url = "#/" + props.file + "/rank/" + result[i].self_id;
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
        url = "#/" + props.file + "/rank/" + r.self_id;
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
                   Counts: <span>{r.cumulative_count} / {r.self_count}</span>,
                   Calls: <span>{r.total_calls} / {r.self_calls}</span>,
                   Paths: <span>{r.total_paths} / {r.self_paths}</span>,
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
    var cumulative_url = "#/" + this.props.params.splat + "/cumulative"
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


var routes = (
  <Route handler={App}>
    <Route handler={FileSelector} path="/"/>
    <Route handler={CumulativeView} path="*/cumulative"/>
    <Route handler={SelfView} path="*/self"/>
    <Route handler={RankView} path="*/rank/:rank"/>
    <Route handler={NotFound} path="*"/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById("content"));
});

Router.run(routes, Router.HashLocation, function (Handler) {
  React.render(<Handler/>, document.getElementById("content"));
});
