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
// postSchema.virtuals함수를 이용해서 아래 항목들을 설정하였다.
// virtuals은 실제 DB에 저장되진 않지만 model에서는 db에 있는 다른 항목들과 동일하게 사용할 수 있는데,
// get, set함수를 설정해서 어떻게 해당 virtual 값을 설정하고 불러올지를 정할 수 있다
// createdAt, updatedAt은 Data 타입으로 설정되어 있는데 javascript은 Data 타입에
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
var Post = mongoose.model("post", postSchema);
module.exports = Post;

// functions
function getDate(dateObj){
 if(dateObj instanceof Date)
  return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth()+1)+ "-" + get2digits(dateObj.getDate());
}

function getTime(dateObj){
 if(dateObj instanceof Date)
  return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes())+ ":" + get2digits(dateObj.getSeconds());
}

function get2digits(num){
 return ("0" + num).slice(-2);
}
