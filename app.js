var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var passport = require("passport");
var session = require("express-session");
var cors = require("cors");
var ObjectID = require("mongodb").ObjectID;
var LocalStrategy = require("passport-local");
var bcrypt = require("bcrypt-nodejs");
var secret = process.env.SESSION_SECRET;
const User = require("./models/users");
const Task = require("./models/tasks");
var mongoDB = process.env.MONGODB_URI;
//Connect to mongoose
mongoose.connect(
  mongoDB,
  { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
var routes = require("./routes/routes");
var app = express();
app.use(cors());
//passport
app.use(
  session({
    secret: secret,
    resave: true,
    saveUninitialized: true
  })
);
//use passport
app.use(passport.initialize());
app.use(passport.session());
//Setup local strategy
passport.use(
  new LocalStrategy(function(username, password, done) {
    //Look up user
    User.findOne({ Username: username }, function(err, user) {
      if (err) {
        console.log("strategy error");
        return done(err);
      }
      //User doesn't exist
      if (!user) {
        console.log("strategy not user");
        return done(null, false);
      }
      //Password and user name do not match
      if (!bcrypt.compareSync(password, user.Password)) {
        console.log("strategy password issue");
        return done(null, false);
      }
      //Success
      console.log("strategy successful");
      return done(null, user);
    });
  })
);
//Serialize and deserialize passport session
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  db.collection("users").findOne({ _id: new ObjectID(id) }, (err, doc) => {
    done(null, doc);
  });
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Use routes
app.use("/", routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
