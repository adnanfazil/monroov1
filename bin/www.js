var app = require("../app");
var debug = require("debug")("findme:server");
// var http = require('http');
const http = require("http");

const mongoose = require("mongoose");

const port = process.argv[2] || process.env.PORT || 3000;
const databaseURL = process.env.MONGO_URL;

app.set("port", port);

//  mongoose.connect(databaseURL, {useNewUrlParser: true  });
mongoose.connect(
  "mongodb+srv://adnanfazil911:fdWuqpO8zI3mPsyV@cluster0.gtbw7.mongodb.net/",
  { useNewUrlParser: true }
);
//  mongoose.connect('mongodb://salah:salah4488366@localhost:27017/monroodb', {useNewUrlParser: true  });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!

  console.log("DB Connected");
  console.log(MONGO_URI);
  // setTimeout(function2, 5000);
});

var server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
