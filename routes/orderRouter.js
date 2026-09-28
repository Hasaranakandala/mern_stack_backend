import express from "express";
const orderRouter =express.Router()

import { createOrder, getOrder, updateOrderStatus } from "../controlers/orderController.js";


orderRouter.post("/",createOrder);
orderRouter.get("/",getOrder);

orderRouter.put("/:orderId/:status",updateOrderStatus);




export default orderRouter;
