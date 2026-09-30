import express from "express";

import {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReview,
  deleteReview
} from "../controlers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", createReview);

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
  updateReview
);

reviewRouter.delete(
  "/:reviewId",
  deleteReview
);

export default reviewRouter;