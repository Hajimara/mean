var express = require("express");
var router = express.Router();
var passport = require("../config/passport");

// Home
router.get("/", function(req, res){
 res.render("home/main");
});

router.get("/material", function(req, res){
 res.render("home/material");
});
router.get("/recipe", function(req, res){
 res.render("home/recipe");
});

// login
// login view를 보여주는 router
router.get("/login", function (req,res) {
  var username = req.flash("username")[0];
  var errors = req.flash("errors")[0] || {};
  res.render("home/login", {
    username:username,
    errors:errors
  });
});
// post login
/*
  form에서 보내는 post request를 처리해주는 라우터
*/
router.post("/login",
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.username){
      isValid = false;
      errors.username = "Username is required!";
    }
    if(!req.body.password){
      isValid = false;
      errors.password = "Password is required!";
    }

    if(isValid){
      next();
    } else {
      req.flash("errors",errors);
      res.redirect("/login");
    }
  },
  passport.authenticate("local-login", {
    successRedirect : "/posts",
    failureRedirect : "/login"
  }
));

//logout
//passport에서 logout함수 제공
router.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});
module.exports = router;
