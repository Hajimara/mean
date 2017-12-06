var express = require("express");
var router = express.Router();
var Post  = require("../models/Post");
// Post module을 사용 (SchemaDB를 말하는 듯)
var util = require("../util");

// Index
router.get("/", function(req, res){// 나중에 생성된 date가 위로 오도록 정렬
 Post.find({})
 .populate("author")            //Model.populate 함수는 relationship이 형성되어 있는 항목의 값을 생성
 .sort("-createdAt")            //현재 post의 author에는 user의 id가 기록되어있는데 이값을 바탕으로
 .exec(function(err, posts){    //실제 user의 값을 author에 생성하게 됨
  if(err) return res.json(err);
  res.render("posts/index", {posts:posts}); // es.render('users', { title: docs });
 });
});
// exec함수 앞에 DB에서 데이터를 어떻게 찾을지,
// 어떻게 정렬할지 등등을 함수로 표현하고, exec안의 함수에서 해당 data를 받아와서 할일을 정하는 구조입니다.
// New
router.get("/new", util.isLoggedin,function(req, res){
  var post = req.flash("post")[0] || {};
  var errors = req.flash("errors")[0] || {};
  res.render("posts/new", { post:post, errors:errors });
});
// router.HTTP_method
// create
router.post("/", util.isLoggedin,function(req, res){
  req.body.author = req.user._id; //글을 작성할 때 req.user._id를 가져와서 post에 author에 기록
 Post.create(req.body, function(err, post){ //req.user는 로그인 시 passport에서 자동 생성
   if(err){
    req.flash("post", req.body);
    req.flash("errors", util.parseError(err));
    return res.redirect("/posts/new");
   }
  res.redirect("/posts");
 });
});

// show
router.get("/:id", function(req, res){
 Post.findOne({_id:req.params.id})
 .populate("author")
 .exec(function(err, post){
  if(err) return res.json(err);
  res.render("posts/show", {post:post});
 });
});

// edit
router.get("/:id/edit",util.isLoggedin, checkPermission, function(req, res){
 var post = req.flash("post")[0];
 var errors = req.flash("errors")[0] || {};
 if(!post){
  Post.findOne({_id:req.params.id}, function(err, post){
   if(err) return res.json(err);
   res.render("posts/edit", { post:post, errors:errors });
  });
 } else {
  post._id = req.params.id;
  res.render("posts/edit", { post:post, errors:errors });
 }
});

// update
router.put("/:id", util.isLoggedin, checkPermission,function(req, res){
 req.body.updatedAt = Date.now();
 Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
  if(err){
   req.flash("post", req.body);
   req.flash("errors", util.parseError(err));
   return res.redirect("/posts/"+req.params.id+"/edit");
  }
  res.redirect("/posts/"+req.params.id);
 });
});

// destroy
router.delete("/:id",util.isLoggedin, checkPermission, function(req, res){
 Post.remove({_id:req.params.id}, function(err){
  if(err) return res.json(err);
  res.redirect("/posts");
 });
});

module.exports = router;

/*
{contacts:contacts}에서 첫번째 contacts는 ejs에서 사용할 key이고
두번째 contacts는 Contact.find({}, function(err, contacts){ ... })에서
콜백함수(function(err, contacts){ ... })로 넘겨진 DB에서 읽어온 contact 리스트.
즉 contacts/index.ejs에서 DB에서 읽어온 contact 리스트를 사용하기 위해서 {contacts:contacts}를 넘겨주는 것
또한 contacts/index.ejs의 <% %> 안의 코드에서 사용되고 있는 contacts가 이때 넘겨받은 contact 리스트를 사용하는 부분

*/

// private functions // 1
function checkPermission(req, res, next){
 Post.findOne({_id:req.params.id}, function(err, post){
  if(err) return res.json(err);
  if(post.author != req.user.id) return util.noPermission(req, res);

  next();
 });
}
//Post에서checkPermission함수는 해당 게시물에 기록된 author와 로그인된 user.id를 비교해서
// 같은 경우 통과, 만약 다르다면 util.noPermission함수를 호출합니다.
