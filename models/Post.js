var mongoose = require("mongoose");

// schema
var postSchema = mongoose.Schema({ // 1
 title:{type:String, required:true},
 body:{type:String},
 createdAt:{type:Date, default:Date.now}, // 2
 updatedAt:{type:Date},
},{
 toObject:{virtuals:true} // 4 virtual들을 object에서 보여주는 mongoose schema의 option
});
// Post의 스키마는 title, body, createdAt, updatedAt으로 구성한다.
// default항목으로는 기본값을 지정 해 줄 수 있다.
// Date.now는 현재시간을 리턴해주는 함수
// postSchema.virtual함수를 이용해서 아래 항목들을 설정하였다.
// 3virtual은 실제 DB에 저장되진 않지만 model에서는 db에 있는 다른 항목들과 동일하게 사용할 수 있는데,
// get, set함수를 설정해서 어떻게 해당 virtual 값을 설정하고 불러올지를 정할 수 있다
// createdAt, updatedAt은 Date 타입으로 설정되어 있는데 javascript은 Date 타입에
// formatting 기능(시간을 어떠한 형식으로 보여줄지 정하는 것, 예를 들어 2017-01-02로 할지, 01-02-2017로 할지 등등)을
// 따로 설정해 주어야 하기 때문에 이와 같은 방식을 택함
// virtuals // 3
postSchema.virtual("createdDate")
.get(function(){
 return getDate(this.createdAt);
});

postSchema.virtual("createdTime")
.get(function(){
 return getTime(this.createdAt);
});

postSchema.virtual("updatedDate")
.get(function(){
 return getDate(this.updatedAt);
});

postSchema.virtual("updatedTime")
.get(function(){
 return getTime(this.updatedAt);
});

// model & export
// 위에서 정의한 스키마모델 postSchema로 컴파일을 한다.
// model객체로 된 schema를 가지고 있다면 모델 의 문서에 접근 하여 작업을 할 수있음
// model(name,[schema],[collection],[skipInit])
// name 나중에 모데라을 찾을 때 model(name)과 같이 사용
// schema Schema객체를 나타냄
// Schema객체를 지정하지 않았다면 collection 파라미터를 통해 컬렉션의 이름을 지정할 수 있음
// skipInit 기본값 false ture면 초기화 프로세스를 건너뛰고 db와 연결되지 않은 상태의 간단한 model객체가 생성됨
var Post = mongoose.model("post", postSchema);
module.exports = Post;

// functions
function getDate(dateObj){
 if(dateObj instanceof Date) // 데이터타입 확인 후
  return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth()+1)+ "-" + get2digits(dateObj.getDate());
}

function getTime(dateObj){
 if(dateObj instanceof Date)
  return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes())+ ":" + get2digits(dateObj.getSeconds());
}

function get2digits(num){
 return ("0" + num).slice(-2);// slice(index,[index]) 앞 인덱스 기준으로 끝까지 자름
}                             // 음수 인덱스는 끝으로부터의 거리
// get2digits는 그냥 숫자의 형태를 마춰주기 위한 함수로,
// 시간을 항상 2자리로 표시하기 위해 만든 함수. 2자리인 숫자를 넣으면 그냥 그대로 나오고
// 한자리인 숫자를 넣으면 앞에 0이 붙어서 나오게 됨
