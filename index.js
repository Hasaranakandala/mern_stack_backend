import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
 

const app = express();




import dns from 'node:dns';

import productRouter from "./routes/productRouter.js";
import userRouter from "./routes/userRouter.js";


dns.setServers([
  '8.8.8.8',
  '8.8.4.4'
]);

app.use(bodyParser.json());

app.use((req,res,next)=>{
  const tokenString=req.header("Authorization");
  if(tokenString!= null){
    const token=tokenString.replace("Bearer ","");
    console.log(token)
    jwt.verify(token,"sune0P@123",(err,decoded)=>{
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


mongoose.connect('mongodb+srv://admin:admin123@cluster0.21lpuuo.mongodb.net/User?appName=Cluster0').then(() => {
  console.log("Database is connected successfully")
}).catch((error) => {
  console.log("Database connection failed:", error);
});




app.use('/product', productRouter);

app.use("/user", userRouter);




app.listen(3000, () => {
  console.log("Server is running on port 3000 and always update using nodeman");
})