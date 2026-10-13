import mongoose from "mongoose";

const orderSchema=mongoose.Schema({

  paymentMethod: {
  type: String,
  enum: [
    "cash_on_delivery",
    "card",
  ],
  default:
    "cash_on_delivery",
},

paymentStatus: {
  type: String,
  enum: [
    "pending",
    "paid",
    "failed",
    "refunded",
  ],
  default: "pending",
},

paymentReference: {
  type: String,
  default: "",
},

  orderId:{
    type:String,
    required:true,
    unique:true
    
  },
  email:{
    type:String,
    required:true
  },
  name:{
    type:String,
    required:true
  },
  phone:{
    type:String,
    required:true
  },
  address:{
    type:String,
    required:true
  },
  status:{
    type:String,
    required:true,
    default:"pending"
  },
  labelTotal:{
    type:Number,
    required:true

  }, 
  total:{
    type:Number,
    required:true
  },
  products:[{
  productInfo:{
    productId:{
      type:String,
      required:true

    },
    name:{
      type:String,
      required:true
    },
    altNames:[{
      type:String
    }],
    description:{
      type:String,
      

    },
    images:[{
      type:String
    }],
    labelPrice:{
      type:Number,
      required:true
    },
    price:{
      type:Number,
      required:true
    } 
  },
  quantity:{
    type:Number,
    required:true
  }


  }],
  date:{
    type:Date,
    default:Date.now
  }

  

});


const Order=mongoose.models.order || mongoose.model("order",orderSchema);

export default Order;
