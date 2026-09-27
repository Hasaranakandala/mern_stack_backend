import express from "express";
const orderRouter =express.Router()

import { createOrder, getOrder } from "../controlers/orderController.js";


orderRouter.post("/",createOrder);
orderRouter.get("/",getOrder)



export default orderRouter;
