import mongoose from "mongoose"

const otpSchema=mongoose.Schema({

  email:{
    type:String,
    require:true
  },
  otp:{
    type:Number,
    require:true
  }



});



const OTP =mongoose.model.otp  || mongoose.model("otp",otpSchema);


export default OTP;

