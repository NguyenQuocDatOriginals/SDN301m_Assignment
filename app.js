var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();

// ************** Import các thư viện liên quan **************
const mongoose = require("mongoose");
require("dotenv").config();

// ************** Import Route **************
const userRoute = require("./routes/user.route");
const categoryRoute = require("./routes/category.route");
const productRoute = require("./routes/product.route");

//  ************** Cấu hình kết nối đến MongoDB **************
const url = "mongodb://127.0.0.1:27017/SDN301m_Assignment";
const connect = mongoose.connect(url);
connect.then((db) => {
  console.log("Đã kết nối đến MongoDB");
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ************** Sử dụng Route - API **************
app.use("/api/categories", categoryRoute);
app.use("/", userRoute);

// ROUTE EJS
app.use("/product", productRoute);
app.use("/category", categoryRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
