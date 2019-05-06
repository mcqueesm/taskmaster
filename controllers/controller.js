//const passport = require('passport');
const bcrypt = require("bcrypt");
const User = require("../models/users");
const Task = require("../models/tasks");
const { check, validationResult } = require("express-validator/check");

//Middleware to verify authentication on protected routes
let ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("redirecting...");
  res.redirect("/");
};
//Remove all completed tasks and redirect to '/profile/completed'
exports.remove_all = function(req, res, next) {
  Task.remove({ Completed: true }, function(err) {
    if (err) next(err);
    res.redirect("/profile/completed");
    return;
  });
};
//Remove a single task (specified by id) and redirect to '/profile/completed'
exports.delete_task = function(req, res, next) {
  Task.findOneAndRemove({ _id: req.params.id }, function(err, doc) {
    if (err) next(err);
    res.redirect("/profile/completed");
  });
};
//If authenticated redirect to profile, else redir to sign in
exports.load_index = function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/profile");
  }
  res.render("index", { title: "" });
};
//Login by saving session and redirecting to profile
exports.handle_login = function(req, res) {
  req.session.save(function() {
    res.redirect("/profile");
  });
};
//If authenticated redirect to profile, otherwise render registration page
exports.handle_registration = function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/profile");
  }
  res.render("register", { body: {}, errors: {} });
};
//Populate profile with all completed tasks belonging to user
exports.load_profile = function(req, res, next) {
  Task.find(
    { User: req.session.passport.user, Completed: false },
    null,
    { Date_added: -1 },
    function(err, tasks) {
      if (err) next(err);
      res.render("profile", { tasks: tasks, title: "Your Tasks" });
    }
  );
};
//Toggle particular task's 'Completed' field between true and false
exports.toggle_completed = function(req, res, next) {
  Task.findOne({ _id: req.params.id }, function(err, temptask) {
    if (err) next(err);
    Task.findOneAndUpdate(
      { _id: req.params.id },
      { Completed: !temptask.Completed },
      function(err, task) {
        if (err) next(err);
        if (!temptask.Completed) {
          res.redirect("/profile");
        } else {
          res.redirect("/profile/completed");
        }
      }
    );
  });
};
//Render profile page populated with all completed tasks
exports.load_completed = function(req, res, next) {
  Task.find({ User: req.session.passport.user, Completed: true }, function(
    err,
    tasks
  ) {
    if (err) next(err);
    res.render("profile", { tasks: tasks, title: "Completed Tasks" });
  });
};
//Create new Task with mongoose model and save to DB
exports.add_task = function(req, res, next) {
  let task = new Task({
    Category: "Default",
    User: req.session.passport.user,
    Date_added: new Date(),
    Description: req.body.task_text,
    Completed: false
  });
  console.log(task.Completed);
  task.save(function(err) {
    if (err) next(err);
    res.redirect("/profile");
  });
};
//Log user out
exports.logout = function(req, res, next) {
  req.logout();
  res.redirect("/");
};
//Use express validator to check registration form for invalid entries
exports.check_errors = [
  check(
    "reg_user",
    "Username must contain only alphanumeric characters and underscore"
  ).matches(/^[a-zA-Z0-9_]+$/, "i"),
  check("reg_first", "First name between 1 and 20 characters").isLength({
    min: 1,
    max: 20
  }),
  check("reg_last", "Last name between 1 and 20 characters").isLength({
    min: 1,
    max: 20
  }),
  check("reg_email", "Invalid email address").isEmail(),
  check("reg_pass", "Password must contain at least 8 characters").isLength({
    min: 8
  })
];
//Handles registration form submition
exports.register_user = function(req, res, next) {
  //Get all errors from form
  const errors = validationResult(req);
  let errorArray = errors.array();

  //Handle errors
  //Ensure password and verify password fields match
  if (req.body.reg_pass !== req.body.reg_verify_pass) {
    errorArray.push({ msg: "Passwords do not match" });
  }
  //If there are errors, rerender registration page with errors
  if (!errors.isEmpty()) {
    res.render("register", { errors: errorArray, body: req.body });
    return;
  }
  //Check to see if user already exists
  User.findOne({ Username: req.body.reg_user }, function(err, user) {
    if (err) next(err);
    else if (user) {
      res.render("register", {
        errors: [{ msg: "Username already taken" }],
        body: req.body
      });
      //If not, hash password and save new user in DB
    } else {
      let hash = bcrypt.hashSync(req.body.reg_pass, 12);
      let newUser = new User({
        Username: req.body.reg_user,
        Password: hash,
        Email: req.body.reg_email,
        First_name: req.body.reg_first,
        Last_name: req.body.reg_last
      });
      newUser.save(function(err) {
        if (err) next(err);
        else {
          res.render("index", { title: "Account has been created!" });
        }
      });
    }
  });
};
