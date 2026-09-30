 
 import Review from "../models/reviews.js";
 import Order from "../models/order.js";

 export async function createReview(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login to add a review"
      });
    }

     const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        message: "Product ID, rating and comment are required"
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    // Check whether customer purchased this product
    const purchasedOrder = await Order.findOne({
      email: req.user.email,

      "products.productInfo.productId": productId,

      status: {
        $in: ["delivered", "completed"]
      }
    });

    if (!purchasedOrder) {
      return res.status(403).json({
        message:
          "You can review this product only after purchasing and receiving it"
      });
    }

    // Check already reviewed
    const existingReview = await Review.findOne({
      productId: productId,
      email: req.user.email
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }

    const review = new Review({
      productId: productId,

      email: req.user.email,

      name:
        req.user.firstName && req.user.lastName
          ? `${req.user.firstName} ${req.user.lastName}`
          : req.user.name || req.user.email,

      rating: Number(rating),

      comment: comment.trim(),

      orderId: purchasedOrder.orderId,

      verifiedPurchase: true
    });

    const savedReview = await review.save();

    return res.status(201).json({
      message: "Review added successfully",
      review: savedReview
    });

  } catch (err) {
    console.log("CREATE REVIEW ERROR:", err);

    return res.status(500).json({
      message: "Failed to add review",
      error: err.message
    });
  }
}

  export async function getProductReviews(req, res) {
  try {
    const productId = req.params.productId;

    const reviews = await Review.find({
      productId: productId
    }).sort({
      date: -1
    });

    return res.status(200).json({
      count: reviews.length,
      reviews: reviews
    });

  } catch (err) {
    console.log("GET PRODUCT REVIEWS ERROR:", err);

    return res.status(500).json({
      message: "Failed to get product reviews",
      error: err.message
    });
  }
}

  export async function getAllReviews(req, res) {
  try {
    const reviews = await Review.find()
      .sort({
        date: -1
      });

    return res.status(200).json({
      count: reviews.length,
      reviews: reviews
    });

  } catch (err) {
    console.log("GET ALL REVIEWS ERROR:", err);

    return res.status(500).json({
      message: "Failed to get reviews",
      error: err.message
    });
  }
}

  export async function updateReview(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login to update review"
      });
    }

    const reviewId = req.params.reviewId;

    const { rating, comment } = req.body;

    const review = await Review.findById(
      reviewId
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    // Only review owner can update
    if (review.email !== req.user.email) {
      return res.status(403).json({
        message:
          "You are not allowed to update this review"
      });
    }

    if (rating !== undefined) {
      if (
        Number(rating) < 1 ||
        Number(rating) > 5
      ) {
        return res.status(400).json({
          message:
            "Rating must be between 1 and 5"
        });
      }

      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      if (comment.trim() === "") {
        return res.status(400).json({
          message:
            "Review comment cannot be empty"
        });
      }

      review.comment = comment.trim();
    }

    const updatedReview =
      await review.save();

    return res.status(200).json({
      message:
        "Review updated successfully",

      review: updatedReview
    });

  } catch (err) {
    console.log("UPDATE REVIEW ERROR:", err);

    return res.status(500).json({
      message: "Failed to update review",
      error: err.message
    });
  }
}

export async function deleteReview(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login to delete review"
      });
    }

    const reviewId = req.params.reviewId;

    const review = await Review.findById(
      reviewId
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    // Only review owner can delete
    if (review.email !== req.user.email) {
      return res.status(403).json({
        message:
          "You are not allowed to delete this review"
      });
    }

    await Review.findByIdAndDelete(
      reviewId
    );

    return res.status(200).json({
      message:
        "Review deleted successfully"
    });

  } catch (err) {
    console.log("DELETE REVIEW ERROR:", err);

    return res.status(500).json({
      message: "Failed to delete review",
      error: err.message
    });
  }
}

