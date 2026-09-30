import express from "express";
import { createUser, getUser, loginUser, loginWithGoogle } from "../controlers/userController.js";



const userRouter = express.Router();



userRouter.get("/", getUser);

userRouter.post("/", createUser);

userRouter.post("/login",loginUser);
userRouter.post("/login/google",loginWithGoogle);





export default userRouter;

