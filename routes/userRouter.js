import express from "express";
import { createUser, getUser, loginUser,getUsers, loginWithGoogle, resetPassword, sendOtp,sendContactMessage } from "../controlers/userController.js";



const userRouter = express.Router();



userRouter.get("/", getUser);

userRouter.post("/", createUser);

userRouter.post("/login",loginUser);
userRouter.post("/login/google",loginWithGoogle);

userRouter.post("/send-otp",sendOtp);

userRouter.post("/reset-password",resetPassword);
userRouter.get("/",getUsers)
 
userRouter.post("/contacts", sendContactMessage)



 

export default userRouter;

