var express = require("express");
var passport = require("passport");
var router = express.Router();
var controller = require("../controllers/controller");
var bcrypt = require("bcrypt-nodejs");

//Require Mongoose Models

let ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};

router.get("/profile/removeall", ensureAuthenticated, controller.remove_all);

router.get("/profile/delete/:id", ensureAuthenticated, controller.delete_task);

router.get("/", controller.load_index);

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/" }),
  controller.handle_login
);

router.get("/register", controller.handle_registration);

router.get("/profile", ensureAuthenticated, controller.load_profile);

router.get(
  "/profile/switch/:id",
  ensureAuthenticated,
  controller.toggle_completed
);

router.get(
  "/profile/completed",
  ensureAuthenticated,
  controller.load_completed
);

router.post("/profile/add", ensureAuthenticated, controller.add_task);

router.get("/logout", ensureAuthenticated, controller.logout);

router.post("/register", controller.check_errors, controller.register_user);

module.exports = router;
