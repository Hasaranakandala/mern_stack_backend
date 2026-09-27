import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import cors from 'cors'
const app = express();

import dotenv from "dotenv";

dotenv.config();



import dns from 'node:dns';
dns.setServers([
  '8.8.8.8',
  '8.8.4.4'
]);

app.use(cors())

import productRouter from "./routes/productRouter.js";
import userRouter from "./routes/userRouter.js";
import orderRouter from './routes/orderRouter.js';


app.use(bodyParser.json());


app.use((req,res,next)=>{
  const tokenString=req.header("Authorization");
  if(tokenString!= null){
    const token=tokenString.replace("Bearer ","");
    console.log(token)
    jwt.verify(token,process.env.JWT_KEY,(err,decoded)=>{
      if(decoded != null){
        console.log(decoded)
        req.user=decoded
        next()
      }else{
        console.log("invalid token");
        res.status(403).json({
          message:"Invalid token"
        })
      }

    })

  }else{
    next();
    
  }
  


})


mongoose.connect(process.env.MONGODB_URL).then(()=>{
  console.log("Database connection successfull")
})
 .catch((error) => {
  console.log("Database connection failed:", error);
});





app.use('/api/product', productRouter);

app.use("/api/user", userRouter);
app.use("/api/order",orderRouter);





app.listen(3000, () => {
  console.log("Server is running on port 3000 and always update using nodeman");
})