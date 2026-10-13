import express from "express";

import {
  createPaymentIntent,
  verifyPaymentIntent,
} from "../controlers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/create-intent",
  createPaymentIntent
);

paymentRouter.get(
  "/verify/:paymentIntentId",
  verifyPaymentIntent
);

export default paymentRouter;