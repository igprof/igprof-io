var http = require('http');
var chokidar = require('chokidar');
var express = require('express');
var sqlite3 = require('sqlite3');

var app = express();

var watcher = chokidar.watch('/data/**/*.sql', {
  persistent: true,
  usePolling: true,
});

var log = console.log.bind(console);

var GLOBAL_CONTEXT = {
  available_sqlite: {}
}

function context(fn) {
  fn(GLOBAL_CONTEXT);
}

var data_path = "[/]data[/]"
var drop_path_re = new RegExp("^" + data_path);

watcher
  .on('add', function(path) { 
      var id = path.replace(drop_path_re, "");
      context(function (ctx) {ctx.available_sqlite[id] = path});
log('File', id, 'has been added'); })
  .on('addDir', function(path) { log('Directory', path, 'has been added'); })
  .on('change', function(path) { log('File', path, 'has been changed'); })
  .on('unlink', function(path) { 
      var id = path.replace(drop_path_re, "");
      context(function (ctx) {delete ctx.available_sqlite[id]; });
log('File', GLOBAL_CONTEXT.available_sqlite, 'has been removed'); })
  .on('unlinkDir', function(path) { log('Directory', path, 'has been removed'); })
  .on('error', function(error) { log('Error happened', error); })
  .on('ready', function() { log('Initial scan complete. Ready for changes.'); })
  .on('raw', function(event, path, details) { log('Raw event info:', event, path, details); })

process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  // some other closing procedures go here
  process.exit( );
})

// Listen on port 8000, IP defaults to 127.0.0.1
var app = express();
app.listen(8888, "0.0.0.0");

app.get('/profile', function(req, res){
  res.send(Object.keys(GLOBAL_CONTEXT.available_sqlite));
});

function verifyId(id, res) {
  var sqliteFile = GLOBAL_CONTEXT.available_sqlite[id];
  if (!sqliteFile)
  {
    res.status(400);
    res.send("Unable to find " + id + ".");
  }
  return sqliteFile;
}

function doQuery(db, query, res, bindings) {
  var stmt = db.prepare(query);
  var result = db.all(query, bindings,
    function(err, rows){
      if (err)
      {
        console.log(err);
        res.status("500");
        res.send("Internal server error");
      }
      res.send(rows);
    });
}

var CUMULATIVE_QUERY = "SELECT mr.id, sym.name, mr.cumulative_count, mr.total_calls" +
                       " FROM mainrows mr "                                          +
                       " INNER JOIN symbols sym ON sym.id in (mr.symbol_id)"         +
                       " ORDER BY mr.cumulative_count DESC "                         +
                       " LIMIT 1000;"

var SELF_QUERY = "SELECT mr.id, sym.name, mr.self_count, mr.self_calls" +
                 " FROM mainrows mr "                                   +
                 " INNER JOIN symbols sym ON sym.id in (mr.symbol_id)"  +
                 " ORDER BY mr.self_count DESC"                         +
                 " LIMIT 1000;"

var PARENT_QUERY = "SELECT p.self_id, sym.name,"                             +
                   "p.to_child_count, myself.cumulative_count,"              +
                   "p.to_child_calls, myself.total_calls,"                   +
                   "p.to_child_paths, myself.total_paths,"                   +
                   "mr.cumulative_count,"                                    +
                   "p.pct"                                                   +
                   " FROM parents p"                                         +
                   " INNER JOIN mainrows mr ON mr.id IN (p.child_id)"        +
                   " INNER JOIN mainrows myself ON myself.id IN (p.self_id)" +
                   " INNER JOIN symbols sym ON sym.id IN (myself.symbol_id)" +
                   " WHERE p.child_id = $rank"                               +
                   " ORDER BY p.to_child_count;"                             

var MAIN_QUERY = "SELECT mr.id, sym.name,"                             +
                 "mr.self_count, mr.cumulative_count,"                 +
                 "mr.kids,"                                            +
                 "mr.self_calls, mr.total_calls,"                      +
                 "mr.self_paths, mr.total_paths,"                      +
                 "mr.pct"                                              +
                 " FROM mainrows mr"                                   +
                 " INNER JOIN symbols sym ON sym.id IN (mr.symbol_id)" +
                 " WHERE mr.id = $rank;"

var CHILDREN_QUERY = "SELECT c.self_id, sym.name,"                             +
                     "c.from_parent_count, myself.cumulative_count,"           +
                     "c.from_parent_calls, myself.total_calls,"                +
                     "c.from_parent_paths, myself.total_paths,"                +
                     "mr.cumulative_count,"                                    +
                     "c.pct"                                                   +
                     " FROM children c"                                        +
                     " INNER JOIN mainrows mr ON mr.id IN (c.parent_id)"       +
                     " INNER JOIN mainrows myself ON myself.id IN (c.self_id)" +
                     " INNER JOIN symbols sym ON sym.id IN (myself.symbol_id)" +
                     " WHERE c.parent_id = $rank"                              +
                     " ORDER BY c.from_parent_count DESC;"                     

app.get(/\/profile\/(.*)\/self/, function(req, res) {
  var id = req.params[0];
  var sqliteFile = verifyId(id, res);
  var db = new sqlite3.Database(sqliteFile, sqlite3.OPEN_READONLY);
  doQuery(db, SELF_QUERY, res, []);
});

app.get(/\/profile\/(.*)\/cumulative/, function(req, res) {
  var id = req.params[0];
  var sqliteFile = verifyId(id, res);
  var db = new sqlite3.Database(sqliteFile, sqlite3.OPEN_READONLY);
  doQuery(db, CUMULATIVE_QUERY, res, []);
});

app.get(/\/profile\/(.*)\/([0-9]+)\/children$/, function(req, res) {
  var id = req.params[0];
  var sqliteFile = verifyId(id, res);
  var db = new sqlite3.Database(sqliteFile, sqlite3.OPEN_READONLY);
  doQuery(db, CHILDREN_QUERY, res, [req.params[1]]);
});

app.get(/\/profile\/(.*)\/([0-9]+)\/parents$/, function(req, res) {
  var id = req.params[0];
  var sqliteFile = verifyId(id, res);
  var db = new sqlite3.Database(sqliteFile, sqlite3.OPEN_READONLY);
  doQuery(db, PARENT_QUERY, res, [req.params[1]]);
});

app.get(/\/profile\/(.*)\/([0-9]+)\/main$/, function(req, res) {
  var id = req.params[0];
  var sqliteFile = verifyId(id, res);
  var db = new sqlite3.Database(sqliteFile, sqlite3.OPEN_READONLY);
  doQuery(db, MAIN_QUERY, res,  [req.params[1]]);
});

app.get(/\/profile\/(.*)/, function(req, res) {
  var id = req.params[0];
  var sqliteFile = verifyId(id, res);
  var db = new sqlite3.Database(sqliteFile, sqlite3.OPEN_READONLY);
  var result = db.each("SELECT * FROM summary;", function(err, row) {
    if (!err)
      res.send(row);
    db.close();
  });
});

app.get("/", function(req, res) {
  res.sendFile("/usr/src/igprof-io/index.html");
});

app.get("/health", function(req, res) {
  res.status(200);
  res.send("");
});

app.get(/.*\/main.js/, function(req, res) {
  res.sendFile("/usr/src/igprof-io/main.js");
});

app.get(/.*\/reactable.js/, function(req, res) {
  res.sendFile("/usr/src/igprof-io/reactable.js");
});

// Put a friendly message on the terminal
console.log("Server running on port 8888");
