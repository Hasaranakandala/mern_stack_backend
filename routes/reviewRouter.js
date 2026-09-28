import express from "express";

import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviews
} from "../controllers/reviewController.js";

import { authenticateUser } from "../middleware/authentication.js";


const reviewRouter = express.Router();



reviewRouter.post(
  "/",
  authenticateUser,
  createReview
);

reviewRouter.get(
  "/product/:productId",
  getProductReviews
);

reviewRouter.get(
  "/",
  getAllReviews
);

reviewRouter.put(
  "/:reviewId",
  authenticateUser,
  updateReview
);


reviewRouter.delete(
  "/:reviewId",
  authenticateUser,
  deleteReview
);

export default reviewRouter;
