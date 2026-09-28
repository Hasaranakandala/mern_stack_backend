import mongoose from  "mongoose";


const productSchema=mongoose.Schema({

 productId:{
  type:String,
  required:true,
  unique:true
 },


 productName:{
  type:String,
  required:true,
  
 },
 alternativeName:[
  {type:String}
 ],
 description:{
  type:String,
  required:true,
 },
 images:[{
  type:String
 }],
 labelPrice:{
  type:Number,
  required:true,
 },
 price:{
  type:Number,
  required:true,
 },
 stock:{
  type:Number,
  required:true,
 },
 isAvailable:{ 

  type:Boolean,
  required:true,
  default:true
 }


}); 

const Product=mongoose.model.product || mongoose.model("product",productSchema);

export default Product;
//sune07P@123
   






