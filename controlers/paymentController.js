import Stripe from "stripe";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import User from "../models/user.js";
import Product from "../models/product.js";

dotenv.config();



const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);



async function getAuthenticatedUser(req) {
  try {
    const authorizationHeader =
      req.headers.authorization;

    if (!authorizationHeader) {
      return {
        success: false,
        status: 401,
        message:
          "Authorization token is required",
      };
    }

    if (
      !authorizationHeader.startsWith(
        "Bearer "
      )
    ) {
      return {
        success: false,
        status: 401,
        message:
          "Invalid authorization format",
      };
    }



    const token =
      authorizationHeader
        .substring(7)
        .trim();

    if (!token) {
      return {
        success: false,
        status: 401,
        message:
          "Authentication token is missing",
      };
    }


    const decoded =
      jwt.verify(
        token,
        process.env.JWT_KEY
      );

    if (
      !decoded ||
      !decoded.email
    ) {
      return {
        success: false,
        status: 401,
        message:
          "Invalid authentication token",
      };
    }



    const user =
      await User.findOne({
        email:
          decoded.email,
      });

    if (!user) {
      return {
        success: false,
        status: 404,
        message:
          "User account not found",
      };
    }

   

    if (user.isBlock) {
      return {
        success: false,
        status: 403,
        message:
          "Your account is currently blocked",
      };
    }

    return {
      success: true,
      user: user,
      decoded: decoded,
    };
  } catch (error) {
    console.error(
      "PAYMENT AUTH ERROR:",
      error.message
    );

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return {
        success: false,
        status: 401,
        message:
          "Your login session has expired",
      };
    }

    return {
      success: false,
      status: 401,
      message:
        "Invalid authentication token",
    };
  }
}



export async function createPaymentIntent(
  req,
  res
) {
  try {
  

    const authResult =
      await getAuthenticatedUser(
        req
      );

    if (
      !authResult.success
    ) {
      return res
        .status(
          authResult.status
        )
        .json({
          message:
            authResult.message,
        });
    }

    const user =
      authResult.user;

  
    const products =
      req.body.products;

    if (
      !Array.isArray(
        products
      ) ||
      products.length === 0
    ) {
      return res
        .status(400)
        .json({
          message:
            "At least one product is required for payment",
        });
    }

 
    let totalAmount = 0;

    const verifiedProducts =
      [];

    for (
      const item of products
    ) {
   

      const productId =
        item.productId;

      if (!productId) {
        return res
          .status(400)
          .json({
            message:
              "Product ID is required",
          });
      }

    

      const quantity =
        Number(
          item.quantity
        );

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        return res
          .status(400)
          .json({
            message:
              `Invalid quantity for product ${productId}`,
          });
      }

     

      const product =
        await Product.findOne({
          productId:
            productId,
        });

      if (!product) {
        return res
          .status(404)
          .json({
            message:
              `Product ${productId} was not found`,
          });
      }

  

      const productPrice =
        Number(
          product.price
        );

      if (
        !Number.isFinite(
          productPrice
        ) ||
        productPrice <= 0
      ) {
        return res
          .status(400)
          .json({
            message:
              `Invalid price for ${product.productName}`,
          });
      }

      

      const stock =
        Number(
          product.stock
        );

      if (
        Number.isFinite(
          stock
        ) &&
        stock <
          quantity
      ) {
        return res
          .status(400)
          .json({
            message:
              `${product.productName} does not have enough stock`,
          });
      }

    

      const itemTotal =
        productPrice *
        quantity;

      totalAmount +=
        itemTotal;

      

      verifiedProducts.push({
        productId:
          product.productId,

        productName:
          product.productName,

        price:
          productPrice,

        quantity:
          quantity,

        itemTotal:
          itemTotal,
      });
    }

   

    if (
      !Number.isFinite(
        totalAmount
      ) ||
      totalAmount <= 0
    ) {
      return res
        .status(400)
        .json({
          message:
            "Invalid payment amount",
        });
    }

    

    const amountForStripe =
      Math.round(
        totalAmount * 100
      );


    const paymentIntent =
      await stripe.paymentIntents.create(
        {
          amount:
            amountForStripe,

          currency:
            "lkr",

          automatic_payment_methods:
            {
              enabled: true,
            },

      

          metadata: {
            userId:
              String(
                user._id
              ),

            email:
              user.email,
          },
        }
      );



    return res
      .status(200)
      .json({
        message:
          "Payment initialized successfully",

        clientSecret:
          paymentIntent.client_secret,

        paymentIntentId:
          paymentIntent.id,

        amount:
          totalAmount,

        currency:
          "LKR",

        products:
          verifiedProducts,
      });
  } catch (error) {
    console.error(
      "CREATE PAYMENT INTENT ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "Unable to prepare card payment",

        error:
          error.message,
      });
  }
}


export async function verifyPaymentIntent(
  req,
  res
) {
  try {
  

    const authResult =
      await getAuthenticatedUser(
        req
      );

    if (
      !authResult.success
    ) {
      return res
        .status(
          authResult.status
        )
        .json({
          message:
            authResult.message,
        });
    }

    const user =
      authResult.user;

   

    const paymentIntentId =
      req.params
        .paymentIntentId;

    if (
      !paymentIntentId
    ) {
      return res
        .status(400)
        .json({
          message:
            "Payment reference is required",
        });
    }

    

    const paymentIntent =
      await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

    if (
      !paymentIntent
    ) {
      return res
        .status(404)
        .json({
          message:
            "Payment was not found",
        });
    }

    

    if (
      paymentIntent
        .metadata
        ?.email !==
      user.email
    ) {
      return res
        .status(403)
        .json({
          message:
            "You are not authorized to access this payment",
        });
    }

  

    return res
      .status(200)
      .json({
        paymentIntentId:
          paymentIntent.id,

        status:
          paymentIntent.status,

        paid:
          paymentIntent.status ===
          "succeeded",

        amount:
          paymentIntent.amount /
          100,

        currency:
          paymentIntent.currency
            .toUpperCase(),
      });
  } catch (error) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "Unable to verify payment",

        error:
          error.message,
      });
  }
}