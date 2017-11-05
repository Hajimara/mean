var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/User");


//serialize, deserialize User
//done함수의 첫번째 파라미터는 항상 error를 담기 위한 것으로 error가
//없다면 null을 담는다.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
/*
  serializeUser는 login시에 db에서 발견한 user를 어떻게 session에
  저장할지 정하는 부분
  session에 저장되는 정보가 너무 많아지면 사이트 성능 하락,
  user object가 변경되면 변경된 부분이 반영되지 못하므로
  user의 id만 session에 저장한다.
*/
passport.deserializeUser(function(id, done) {
  User.findOne({_id:id}, function(err, user) {
    done(err, user);
  });
});
/*
  deserializeUser는 session에서 어떻게 user object를 만들지 정하는 부분
  매번 request마다 user 정보를 db에서 새로 읽어오는데, user가 변경되면
  바로 변경된 정보가 반영되는 장점이 있다. request마다 db를 읽게되는 단점도
  있다.
*/

// local Strategy
passport.use("local-login",
  new LocalStrategy({
      usernameField : "username",
      passwordField : "password",
      passReqToCallback : true
    },
    //로그인 form의 항목이름이 email, pass라면
    //usernameField : "email", passwordField : "pass"로 해야 합니다
    function(req,username,password,done){
      User.findOne({username:username})
      .select({password:1})
      .exec(function(err,user){
        if(err) return done(err);
    /*
      로그인 시 이 함수 호출 db에서 해당 user를 찾고 user model에 설정했던
      user.authenticate 함수를 사용해서 입력받은 password와 저장된
      password hash를 비교해서 값이 일치하면 해당 user를 done에 담아서 반환하고
      return done(null,user);, 그렇지 않은경우 username flash와 에러 flash를
      생성한 후 done에 false를 담아 return 한ㄷ. return done(null,flase);
      user가 전달되지 않으면 local-strategy는 실패로 간주
    */
        if(user && user.authenticate(password)){
          return done(null, user);
          //authenticate() -> user의 password hash를 비교하는 함수
        } else{
          req.flash("username",username);
          req.flash("errors", {login:"Incorrect username or password"});
          return done(null,false);
        }
      });
    }
  )
);
