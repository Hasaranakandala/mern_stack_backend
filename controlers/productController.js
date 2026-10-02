
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
if(isAdmin(req)){
   const product=await Product.find();
 res.json(product);

}else{
   const product=await Product.find({isAvailable:true});
 res.json(product);

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

export async function updateProduct(req,res){
  if(!isAdmin(req)){
    res.status(403).json({
      message:"Youare not authorized to update product"
    });
    return ;

  }
  const productId=req.params.productId;
  const updatingData=req.body;
  try{
await Product.updateOne({productId:productId}, updatingData);
res.json({
  message:"Product updated successfully"
});




  }catch(err){
    res.stats(500).json({
      message:"Internal server error",
      error:err
    })

  }


}


export async function getProductById(req,res){
  const productId=req.params.productId;
 /* if(!isAdmin(req)){
    res.status(403).json({
      message:"You are not authorized to get product by id"
    })

  }
    */
    
try{
const product=await Product.findOne({productId:productId});
if(product==null){
  res.status(404).json({
    message:"The product is not found"
  })
  return ;

}
if(product.isAvailable){
  res.json(product);

}
else{
  if(!isAdmin(req)){
    res.status(404).json({
    message:"The product is not found"
  });
  return ;


  }else{
    res.json(product);

  }

}


}
catch(err){
  res.status(500).json({
    message:"Internal server error",
    error:err
  })


}

}

export async function getSearchProduct(req,res){

  const searchQuery=req.params.query;
  try{

    const products=await Product.find({
      $or:[
        {productName:{$regex:searchQuery,$options:"i"}},
        {alternativeName:
          {$eleMatch:
          {$regex:searchQuery,$options:"i"}}
        }
      ],
      isAvailable:true
    });

    res.json(products);


  }catch(err){
    res.status(500).jdon({
      message:"Internel server error",
      error:err
    })


  }

}