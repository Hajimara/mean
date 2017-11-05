var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
// schema object 생성
// required 반드시 값이 입력되어야 함
// unique 유일한 값이어야 함
var userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,"Username is required"],
    match:[/^.{4,12}$/,"Should be 4-12 characters!"],//문자열 검사, 해당 표현식에 맞지 않으면 에러메시지 출력
    trim:true,//trim 문자열 앞뒤 공백 제거
    unique:true
  },
  password:{
    type:String,
    required:[true,"Password is required"],
    select:false,
  },
  name:{
    type:String,
    required:[true,"Name is required"],
    match:[/^.{2,12}$/,"Should be 2-12 charachters"],
    trim:true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-z0-9.-]+.[a-zA-Z]{2,}$/,"Should be a vaild eamil address!"],
    trim:true
  }
},{
  toObject:{virtuals:true}
});// virtuals DB에 있는 데이터를 변경해서 사용하기
// 위한 것 하지만 가상이라 DB 데잍터는 실제로 변하지
// 않는다.

// ejs에서 가져다 가상으로 사용할 수 잇게
// virtual로 가공
// virtual
userSchema.virtual("passwordConfirmation")
.get(function(){return this._passwordConfirmation;})
.set(function(value){ this._passwordConfirmation=value;});

userSchema.virtual("originalPassword")
.get(function(){return this._originalPassword;})
.set(function(value){ this._originalPassword=value;});

userSchema.virtual("currentPassword")
.get(function(){return this._currentPassword;})
.set(function(value){this._currentPassword=value;});

userSchema.virtual("newPassword")
.get(function(){return this._newPassword;})
.set(function(value){this._newPassword=value;});

//password Vaildation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage="Should be minimum 8 charachters of  alphabet and number combination";

// password 유효 확인
// custom validation함수를 지정한다.
userSchema.path("password").validate(function(v){
  var user = this;
  // 함수 내의 this는 user지정
//여기서부터 1024
  // user 생성시
  if(user.isNew){ // isNew - user(model)가 db에 저장되지않은 새로운 객체면 true반환
    if(!user.passwordConfirmation){ // 회원가입 시 패스워드 확인 값이 비어있는 경우
      user.invalidate("passwordConfirmation", "Password Confirmation is required!");
    }
    if(!passwordRegex.test(user.password)){//정규표현식.test(문자열)는 문자열에 정규표현식이 해당되는 곳이 있다면 true 해당안되면 false return
      user.invalidate("password", passwordRegexErrorMessage);
    // 확인 패스워드가 일치하지 않을 경우 invalidate(유효하지않음처리)를 하게 된다.
    //model.invalidate(항목이름,에러메세지)함수를 사용
    }else if(user.password !== user.passwordConfirmation) {
      user.invalidate("passwordConfirmation","Password Confirmation does not matched");
    }
  }
  //user 수정시
  if(!user.isNew){//현재 비밀번호 값이 없는 경우
    if(!user.currentPassword){
      user.invalidate("currentPassword", "Current Password is required!");
    }
    // currentPassword가 originalPassword와 일치하지 않는경우
    if(user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      user.invalidate("currentPassword", "Current Password is invalid!");
    }//새로입력한 password와 passowrd confirmation
    //bcrypt의 compareSync함수를 사용하여 저장된 hash와 입력받은 password의 hash가 일치하는지 확인
    //user.currentPassword는 입력받은 text값이고 user.originalPassword는 user의 password hash값
    // hash를 해독해서 text를 비교하는것이 아니라 text값을 hash로 만들고 그 값이 일치하는 지를 확인하는 과정
    if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("newPassword", passwordRegexErrorMessage);
    } else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
    }
  }
});
//Schema.pre 함수는 첫번째 파라미터로 설정된 event가 일어나기 전(pre)에
//먼저 callback 함수를 실행시킵니다
//save 이벤트는 model.create,model.save함수 실행시 발생하는 이벤트임
//즉 유저를생성하거나 정보수정 후 저장할 때 콜백함수 먼저 실행됨
userSchema.pre("save",function(next){
  var user = this;
  if(!user.isModified("password")){
    return next();
    //isModified는 해당 값(user)이 db에 기록 된 값과 비교해서 변경된 경우 true를
    //그렇지 않은 경우 false를 return한다.
    //user생성시 무조건 true이고 수정 시 password를 변경했을 시만 true이다.
    //user.password의 변경이 없는 경우라면 이미 해당위치에 hash가 저장되어 있기때문에 다시 만들지 않음
  }else{
    user.password = bcrypt.hashSync(user.password);
    return next();
    //user 생성 시 , user 수정시 user.password의 변경이 있는 경우 bcrypt.hashSync함수로
    //password를 hash값으로 바꾼다.
  }
});

userSchema.method.authenticate = function(password){
  var user=this;
  return bcrypt.compareSync(password,user.password);
};

//user model의 password hash와 입력받은 password text를 비교하는 method를 추가합니다.
//나중에 로그인을 만들때 될 method

// Schema를 model 객체로 만들어 문서에서 사용 할 수 있게 한다.
var User = mongoose.model("user",userSchema);

module.exports = User;
