import mongoose from "mongoose";


const userSchema =mongoose.Schema({

email:{
  type: String,
  required:true,
  unique:true

},
firstName:{
  type:String,
  required:true
},
lastName:{
  type:String,
  required:true
},
password:{
  type:String,
  required:true
},
role:{
  type:String,
  required:true,
  default:"customer"
},
isBlock:{
  type:Boolean,
  required:true,
  default:false,
  
},
img : {
  type:String,
  required:true,
  default:"https://media.istockphoto.com/id/2149922267/vector/user-icon.jpg?s=612x612&w=0&k=20&c=i6jYPfB1pWjK8pll6YRxAK9fgBmf65-w5wbKH9R1dyQ="
}





}
);

const User=mongoose.model.user || mongoose.model("user",userSchema);


export default User;
