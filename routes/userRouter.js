import express from "express";
import { createUser, getUser, loginUser, loginWithGoogle, resetPassword, sendOtp } from "../controlers/userController.js";



const userRouter = express.Router();



userRouter.get("/", getUser);

userRouter.post("/", createUser);

userRouter.post("/login",loginUser);
userRouter.post("/login/google",loginWithGoogle);

userRouter.post("/send-otp",sendOtp);

userRouter.post("/rests-password",resetPassword);
 


 

export default userRouter;

