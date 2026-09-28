import Order from "../models/order.js";
import Product from "../models/product.js";


import { isAdmin } from "./userController.js";
export async function createOrder(req, res) {
  try {
    // Check whether user is logged in
    if (req.user == null) {
      return res.status(403).json({
        message: "Login and try again"
      });
    }

    const orderInfo = req.body;

    // Add logged-in user's name if name is not provided
    if (orderInfo.name == null) {
      orderInfo.name =
        req.user.firstName + " " + req.user.lastName;
    }

    // Validate products
    if (
      !orderInfo.products ||
      orderInfo.products.length === 0
    ) {
      return res.status(400).json({
        message: "No products in order"
      });
    }

    // Generate order ID
    let orderId = "CBC00001";

    const lastOrder = await Order.find()
      .sort({ date: -1 })
      .limit(1);

    if (lastOrder.length > 0) {
      const lastOrderId = lastOrder[0].orderId;

      const lastOrderNumberString =
        lastOrderId.replace("CBC", "");

      const lastOrderNumber =
        parseInt(lastOrderNumberString);

      const newOrderNumber =
        lastOrderNumber + 1;

      const newOrderNumberString =
        String(newOrderNumber).padStart(5, "0");

      orderId = "CBC" + newOrderNumberString;
    }

    console.log("Generated Order ID:", orderId);

    let total = 0;
    let labelTotal = 0;

    const products = [];

    // Process products
    for (let i = 0; i < orderInfo.products.length; i++) {
      const requestedProduct = orderInfo.products[i];

      const item = await Product.findOne({
        productId: requestedProduct.productId
      });

      // Product not found
      if (item == null) {
        return res.status(404).json({
          message:
            "Product with productId " +
            requestedProduct.productId +
            " is not found"
        });
      }

      // Product unavailable
      if (item.isAvailble === false) {
        return res.status(400).json({
          message:
            "Product with productId " +
            requestedProduct.productId +
            " is not available"
        });
      }

      console.log("FOUND PRODUCT:", item);
      console.log("PRODUCT NAME:", item.name);

      products.push({
        productInfo: {
          productId: item.productId,
          name: item.productName,
          altNames: item.altNames,
          description: item.description,
          images: item.images,
          labelPrice: item.labelPrice,
          price: item.price
        },

        quantity: requestedProduct.quantity
      });

      total += item.price * requestedProduct.quantity;

      labelTotal +=
        item.labelPrice * requestedProduct.quantity;
    }

    console.log("Products:", products);

    // Create order
    const order = new Order({
      orderId: orderId,
      email: req.user.email,
      name: orderInfo.name,
      address: orderInfo.address,
      phone: orderInfo.phone,
      products: products,
      labelTotal: labelTotal,
      total: total
    });

    const createdOrder = await order.save();

    return res.status(201).json({
      message: "Order created successfully!",
      orderId: createdOrder.orderId
    });

  } catch (err) {
  console.error("CREATE ORDER ERROR:");
  console.error(err);
  console.error("ERROR MESSAGE:", err.message);

  return res.status(500).json({
    message: "Failed to create order",
    errorMessage: err.message
  });
}
}
/*
export async function getOrder(){

if(req.user==null){
res.status(403).json({
message:"please login and try again !"
})
return;

}
try{
if(req.user.role=="admin"){

const orders=await Order.find({email:req.user.email}).sort({

date:-1

}



);
res.json(orders);

}
else{
const orders=await Order.find({email:req.user.email}).sort({

date:-1

});
res.json(orders);

}

}catch (err){
res.status(500).json({
message:"Failed to fetch orders ",
error:err,
});



}

}

*/
export async function getOrder(req, res) {
  try {
    const orders = await Order.find();

    return res.json(orders);

  } catch (err) {
    console.error("GET ORDERS ERROR:", err);

    return res.status(500).json({
      message: "Failed to fetch orders",
      errorMessage: err.message
    });
  }
}

export async function updateOrderStatus(req, res) {

  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to update order status!"
    });
  }

  try {
    const orderId = req.params.orderId;
    const status = req.params.status;

    console.log("ORDER ID:", orderId);
    console.log("NEW STATUS:", status);

    const result = await Order.updateOne(
      {
        orderId: orderId
      },
      {
        status: status
      }
    );

    console.log("UPDATE RESULT:", result);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.json({
      message: "Order status updated successfully!"
    });

  } catch (err) {
    console.log("UPDATE ORDER ERROR:", err);
    console.log("ERROR MESSAGE:", err.message);

    return res.status(500).json({
      message: "Failed to update order status",
      errorMessage: err.message
    });
  }
}