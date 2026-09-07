
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";



export async function getProduct(req,res){

  //Product.find().then((data)=>{
    //res.status(200).json(data)
  //}).catch(()=>{
   // res.json({
      //message:"The product is not //found in the database "
   // })
 // });


 try{
if(isAdmin){
   const product=await product.find();
 res.json(products);

}else{
   const product=await product.find({isAvailable:true});
 res.json(products);

}



 }catch(err){

  res.json({
      message:"The product is not found in the database ",
      error:err
   })


 }

  



}

export function saveProduct(req,res){

if(!isAdmin(req)){
res.status(403).json({
  message:"You are not authorized to add a products "
})
return ;



}





const product=new Product({
  productId:req.body.productId,
  productName:req.body.productName,
  alternativeName:req.body.alternativeName,
  description:req.body.description,
  labelPrice:req.body.labelPrice,
  price:req.body.price,
  stock:req.body.stock,
  isAvailable:req.body.isAvailable,
  images:req.body.images
});


product.save().then(()=>{
  res.json({
    message:"The product succeesffully saved !"
  })
}).catch(()=>{
  res.json({
    message:"The product is not successfully saved !"
  })
});






}

export async function deleteProduct(req,res){
if(!isAdmin){
  res.status(403).json({
    message:"You are not authorized to delete product  "
  })
  return ;
 
}
try{
await Product.deleteOne({productId:req.params.productId});

res.json({
  message:"The product delete successfully"

});


}catch(err){
  res.status(500).json({
    message:"Failed to delete product"

  });

}




}