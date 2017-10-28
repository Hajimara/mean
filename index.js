var express        = require("express");
var mongoose       = require("mongoose");
var bodyParser     = require("body-parser");
var methodOverride = require("method-override");
var flash          = require("connect-flash");
var session        = require("express-session");
var app = express();

// DB setting
mongoose.connect(process.env.MONGO_DB, { useMongoClient: true }); // 1
var db = mongoose.connection;
db.once("open", function(){
 console.log("DB connected");
});
db.on("error", function(err){
 console.log("DB ERROR : ", err);
});

// Other settings
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());   //flash 초기화 함수사용가능
app.use(session({secret:"MySecret"}));
//req.flash(문자열, 저장할_값) 의 형태로 저장할_값
//(숫자, 문자열, 오브젝트등 어떠한 값이라도 가능)을 해당 문자열에 저장
//이때 flash는 배열로 저장되기 때문에 같은 문자열을 중복해서 사용하면 순서대로 배열로 저장이 됨
//req.flash(문자열) 인 경우 해당 문자열에 저장된 값들을 배열로 불러옵니다. 저장된 값이 없다면 빈 배열([])을 return
//session은 서버에서 접속자를 구분시키는 역할
//user1과 user2가 웹사이트를 보고 있는 경우 해당 user들을 구분하여
//서버에서 필요한 값 들(예를 들어 로그인 상태 정보 등등)을 따로 관리하게 됨.
// flash에 저장되는 값 역시 user1이 생성한 flash는 user1에게,
//user2가 생성한 flash는 user2에게 보여져야 하기 때문에 session이 필요
// Routes
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts")); // posts를 호출한 경우에만 이 route를 사용함
app.use("/users", require("./routes/users"));
// Port setting
app.listen(3000, function(){
 console.log("server on!");
});

//mongo ds149874.mlab.com:49874/recipehouse -u <dbuser> -p <dbpassword> db 시동
