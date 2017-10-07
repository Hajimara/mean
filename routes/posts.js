var express = require("express");
var router = express.Router();
var Post  = require("../models/Post");
// Post module을 사용 (SchemaDB를 말하는 듯)

// Index
router.get("/", function(req, res){// 나중에 생성된 date가 위로 오도록 정렬
 Post.find({})                  // 1
 .sort("-createdAt")            // 1
 .exec(function(err, posts){    //
  if(err) return res.json(err);
  res.render("posts/index", {posts:posts}); // es.render('users', { title: docs });
 });
});
// exec함수 앞에 DB에서 데이터를 어떻게 찾을지,
// 어떻게 정렬할지 등등을 함수로 표현하고, exec안의 함수에서 해당 data를 받아와서 할일을 정하는 구조입니다.
// New
router.get("/new", function(req, res){
 res.render("posts/new");
});
// router.HTTP_method
// create
router.post("/", function(req, res){
 Post.create(req.body, function(err, post){
  if(err) return res.json(err);
  res.redirect("/posts");
 });
});

// show
router.get("/:id", function(req, res){
 Post.findOne({_id:req.params.id}, function(err, post){
  if(err) return res.json(err);
  res.render("posts/show", {post:post});
 });
});

// edit
router.get("/:id/edit", function(req, res){
 Post.findOne({_id:req.params.id}, function(err, post){
  if(err) return res.json(err);
  res.render("posts/edit", {post:post});
 });
});

// update
router.put("/:id", function(req, res){
 req.body.updatedAt = Date.now(); // 2
 Post.findOneAndUpdate({_id:req.params.id}, req.body, function(err, post){
  if(err) return res.json(err);
  res.redirect("/posts/"+req.params.id);
 });
});

// destroy
router.delete("/:id", function(req, res){
 Post.remove({_id:req.params.id}, function(err){
  if(err) return res.json(err);
  res.redirect("/posts");
 });
});

module.exports = router;
