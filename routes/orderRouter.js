import express from "express";
const orderRouter =express.Router()

import { createOrder } from "../controlers/orderController.js";


orderRouter.post("/",createOrder);



export default orderRouter;
