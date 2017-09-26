var express = require("express");
var router = express.Router();

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

module.exports = router;
