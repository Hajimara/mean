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
// user 생성시 에러가 발생하면 new페이지에 에러와 기존에 입력했던 값들을 보여주게되는데,
// 이 값들은 create route에서 생성된 flash로 부터 받아옴 flash는 배열
router.get("/new",function(req,res){
  var user = req.flash("user")[0] || {}; // 하나 이상의 값이 저장되는 경우는 없고 있더라도 오류이므로 무조건 0의 값을 읽어오게함
  var errors = req.flash("errors")[0] || {}; // 값이 없다면 (처음 NEW페이지에 들어온 경우) ||{}를 사용하여 빈 오프젝트로 users/new페이지 생성
  res.render("users/new", { user:user, errors:errors });
});

// create
// user생성시 에러가 발생하면 user, errors flash를 만들고 new 페이지로 redirect
// 오류발생  userschema에 validate를 통과하지 못하거나, mongoDB에서 오류를 내거나 둘 중 하나
router.post("/",function(req,res){//req.body user/new에서 폼을 전달받아 req.body
  User.create(req.body,function(err,user){
    if(err){
      req.flash("user", req.body);
      req.flash("errors", parseError(err));
      return res.redirect("/users/new");
    }
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
// edit에 처음 접속하는 경우 DB에서 값을찾아 form에 기본값을 생성하고 ,update에 오류가 발생해돌아오는 경우
// 기존에 있던 값으로 form에 값들을 생성해야 함
// 이를 위해 user에 || {}를 사용하지 않음
// flash에 값이 있으면 오류가 있는경우, flash에 값이 없으면 처음 들어온 경우로 가정
router.get("/:username/edit",function(req,res){
  var user = req.flash("user")[0];
  var errors = req.flash("errors")[0] || {};
  if(!user){
    User.findOne({username:req.params.username},function(err,user){
      if(err) return res.json(err);
      res.render("users/edit",{username:req.params.username, user:user, errors:errors});
    });
  }else{
      res.render("users/edit",{username:req.params.username, user:user, errors:errors});
  }
});

// update
router.put("/:username",function(req,res,next){
  User.findOne({username:req.params.username})
  .select({password:1}) //select로 db에서 항목을 선택한다 현재 false로 지정하여 선택을 해야 사용 할 수 있음
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
     if(err){
       req.flash("user",req.body);
       req.flash("errors",parseError(err));
       return res.redirect("/users/"+req.params.username+"/edit");
     }
     res.redirect("/users/"+user.username);
    });
  });
});

module.exports = router;


//Function
//mongoose에서 내는 에러와 mongoDB에서 내는 에러의 형태가 다르기 때문에 이 함수를 통하여
//에러의 형태를 {항목이름 : {message : "에러 메세지"}}로 통일시켜주는 함수
function ParseError(errors){
  var parsed = {};
  console.log("errors: ", errors);// 콘솔에서 에러 원형 확인
  if(errors.name == 'ValidationError'){ //mongoose의 model validaion error를 처리
    for(var name in errors.errors){
      var validationError = errors.errors[name];
      parsed[name] = {message:ValidationError.message};
    }
  }else if(errors.code == "11000" && errors.errmsg.indexOf("username")>0){
    parsed.username = { message:"This username already exists!"}; // mongoDB에서 username이 중복되는 에러 처리
  }else{ // 그외 에러 처리
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed;
}
