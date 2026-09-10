import Order from "../models/order.js";

import Product from "../models/product.js"

export async function createOrder(req,res){



  //get user information
if(req.user==null){
  res.status(403).json({
    message:"Login and try again"
  })
  return ;

}
const orderInfo=req.body
if(orderInfo.name==null){
  orderInfo.name=req.user.firstName+" "+req.user.lastName

}
let orderId="CBC00001"
const lastOrder=await Order.find().sort({date:-1}).limit(1);
//that give single array []
if(lastOrder.length>0)  {
  const lastOrderId=lastOrder[0].orderId;
  //CBC00551
  const lastOrderNumberString=lastOrderId.replace("CBC","");
  const lastOrderNumber=parseInt(lastOrderNumberString); //551
  const newOrderNumber=lastOrderNumber+1//552
  const newOrderNumberString=String(newOrderNumber).padStart(5,"0");
  orderId="CBC"+newOrderNumberString;


}

try{
  let total=0;
  let labelTotal=0;
  const products=[];

  for(let i=0;i<orderInfo.products.length;i++){

    const item= await Product.findOne({
      productId:orderInfo.products[i].
      productId
    });
    if(item==null){
      res.status(404).json({
        message: "product with productId  "+orderInfo.products[i].productId+ " is not found "
      }); 
      return;
    }
    if(item.isAvailble==false){
      res.status(404).json({
        message:"product with productId "+orderInfo.products[i].productId +" is not available"
      });

      return;


    }
    products[i]={   
      productInfo:{
        productId:item.productId,
        name:item.name,
        altNames:item.altNames,
        description:item.description,
        images:item.images,
        labelPrice:item.labelPrice,
        price:item.price

      },quantity:orderInfo.products[i].quantity

    }
    total+=item.price*orderInfo.products[i].quantity;
    labelTotal+=item.labelPrice*orderInfo.products[i].quantity;



      }
    
    
  



  const order= new Order({
    orderId:orderId,
    email:req.user.email,
    name:orderInfo.name,
    addres:orderInfo.addres,
    phone:orderInfo.phone,
    total:0,
    products:products,
    labelTotal:labelTotal,
    total:total,

  })
   
  const createdOrder=await order.save()
  res.json({
    message:"order created succesfully!",
    orderId:createdOrder
    

  })

}
catch(err){
  res.status(500).json({
    message:"failed to create order",
    error:err
  })
}



  //add current user name if not provided 
  //get product information
  //orderId generate



}