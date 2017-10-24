var express = require("express");
var router = express.Router();
var User = require("../models/User");
// Index
router.route("/").get(function(req,res){
  User.find({})
  .sort({username:1}) //username 기준 내림차순 정렬
  .exec(function(err,users){
    if(err) return res.json(err);
    res.render("users/index",{users:users});
  });
});

// New
router.get("/new",function(req,res){
  res.render("users/new",{user:{}});
});

// create
router.post("/",function(req,res){//req.body user/new에서 폼을 전달받아 req.body
  User.create(req.body,function(err,user){
    if(err) return res.json(err);
    res.redirect("/users");
  });
});

// show
router.get("/:username", function(req, res){
 User.findOne({username:req.params.username}, function(err, user){
  if(err) return res.json(err);
  res.render("users/show", {user:user});
 });
});

// edit
router.get("/:username/edit",function(req,res){
  User.findOne({username:req.params.username},function(err,user){
    if(err) return res.json(err);
    res.render("users/edit",{user:user});
  });
});

// update
router.put("/:username",function(req,res,next){
  User.findOne({username:req.params.username})
  .select("password") //select로 db에서 항목을 선택한다 현재 false로 지정하여 선택을 해야 사용 할 수 있음
  .exec(function(err,user){
    if(err) return res.json(err);
    //form으로 전송된 data를 사용하기 위해서는 body-parser를 사용해야 함
    // edit에서 폼을 전달받기 때문에 req.body를 쓴다.
    // 수정 할 경우, 안 할 경우
    user.originalPassword = user.password;
    //user.originalPassword에 DB에서 가져온 password를 담아두는 부분.
    //user수정 form에서 newPassword가 있으면 password에 newPassword가 들어가기 때문에
    //원래 비밀번호를 따로 담아둬야 currentPassword와 값이 일치하는지 비교할 수 있기 때문이다.
    user.password = req.body.newPassword? req.body.newPassword : user.password; // 2-3
    //js에서는 삼항 연산자는 값이없을 때 거짓 값이 있을 때 참을 반환하게 된다.
    //req.body.newPassword에 값이 있으면 req.body.newPassword를 반환하여 대입하게 되고
    //값이 없으면 user.password를 반환하여 대입하게 된다.
    for(var p in req.body){
     user[p] = req.body[p];
    }
    //수정된 값을 하나씩 대입하여 변환
    // save updated user
    user.save(function(err, user){
     if(err) return res.json(err);
     res.redirect("/users/"+req.params.username);
    });
  });
});

module.exports = router;
