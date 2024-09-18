var createError = require("http-errors");
var express = require("express");
const http = require("http");
const initializeSocketServer = require("./socketServer");
const cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
require("dotenv").config();
var app = express();

const server = http.createServer(app);
const io = initializeSocketServer(server);
app.set("io", io);

const swaggerSetup = require("./swagger");

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:3000", "*"], // Change * to react domain hosting in future
};
app.use(cors()); // Use the cors middleware with your options

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

var lookups = require("./apis/lookups");
app.use("/monroo/apis/lookups", lookups);

var payment = require("./apis/payment");
app.use("/monroo/apis/payment", payment);

var apiUser = require("./apis/user");
app.use("/monroo/apis/user", apiUser);

var apiProvider = require("./apis/provider");
app.use("/monroo/apis/provider", apiProvider);

swaggerSetup(app);

// app.use('/', (req, res) => {
//   return res.redirect('monroo');
// })

app.use("/*", (req, res) => {
  res.status(404).send({
    message: "not found",
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
