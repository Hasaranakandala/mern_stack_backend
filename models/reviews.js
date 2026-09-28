import mongoose from "mongoose";


const reviewSchema=mongoose.Schema({
reviewId:{
  type:String,
  required:true,
  unique:true
}
,
productId:{
  type:String,
  required:true,
  unique:true
},
email:{
  type:String,
  required:true
},
rating:{
  type:String,
  min:1,
  max:5,
  required:true
},
comment:{
  type:String,
  required:true,
  trim:true
},
date:{
  type:Date,
  default:Date.now()
},
verifiedPurchase: {
  type: Boolean,
  default: false
}


});



const Review=mongoose.model.review || mongoose.model("review",reviewSchema);

export default Review;

