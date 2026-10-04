import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    required: true,
    unique: true,
  },

  productId: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  orderId: {
    type: String,
    required: true,
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },

  comment: {
    type: String,
    required: true,
    trim: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  verifiedPurchase: {
    type: Boolean,
    default: false,
  },
});

// One customer can review one product only once
reviewSchema.index(
  {
    productId: 1,
    email: 1,
  },
  {
    unique: true,
  }
);

const Review =
  mongoose.models.review ||
  mongoose.model(
    "review",
    reviewSchema
  );

export default Review;