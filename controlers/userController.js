import User from "../models/user.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

export async function createUser(req, res) {
  try {


    if (req.body.role === "admin") {

      if (req.user != null) {

        if (req.user.role !== "admin") {

          return res.status(403).json({
            message:
              "You are not authorized to create an admin account"
          });

        }

      } else {

        return res.status(403).json({
          message:
            "You are not authorized to create an admin account. Please login first"
        });

      }
    }




    const firstName =
      req.body.firstName?.trim();

    const lastName =
      req.body.lastName?.trim();

    // NO toLowerCase()
    const email =
      req.body.email?.trim();

    const password =
      req.body.password;

    const role =
      req.body.role || "customer";




    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        message:
          "First name, last name, email and password are required"
      });

    }


   



    const existingUser =
      await User.findOne({
        email: email
      });


  

    console.log(
      "REGISTER EXISTING USER:",
      existingUser
        ? existingUser.email
        : "NO USER"
    );




    if (existingUser) {

      return res.status(409).json({
        message:
          "An account with this email already exists"
      });

    }





    const hashedPassword =
      bcrypt.hashSync(
        password,
        10
      );




    const user = new User({

      firstName:
        firstName,

      lastName:
        lastName,

      email:
        email,

      password:
        hashedPassword,

      role:
        role

    });



    const savedUser =
      await user.save();


    console.log(
      "USER CREATED SUCCESSFULLY:",
      savedUser
    );


    return res.status(201).json({
      message:
        "User account created successfully"
    });


  } catch (error) {

    console.error(
      "CREATE USER ERROR:",
      error
    );


    return res.status(500).json({

      message:
        "User account could not be created",

      error:
        error.message

    });

  }
}

// adding google through login

export async function loginWithGoogle(
  req,
  res
) {
  try {
    const accessToken =
      req.body.accessToken;

    if (!accessToken) {
      return res
        .status(400)
        .json({
          message:
            "Access Token is required",
        });
    }

    /*
    ============================================
    GET GOOGLE USER INFORMATION
    ============================================
    */

    const response =
      await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization:
              "Bearer " +
              accessToken,
          },
        }
      );

    console.log(
      "GOOGLE USER:",
      response.data
    );

    const googleUser =
      response.data;

    /*
    ============================================
    FIND EXISTING USER
    ============================================
    */

    let user =
      await User.findOne({
        email:
          googleUser.email,
      });

    /*
    ============================================
    CREATE USER IF NEW
    ============================================
    */

    if (!user) {
      const newUser =
        new User({
          email:
            googleUser.email,

          firstName:
            googleUser.given_name,

          lastName:
            googleUser.family_name,

          password:
            "googleUser",

          img:
            googleUser.picture,
        });

      user =
        await newUser.save();
    }

    /*
    ============================================
    BLOCKED ACCOUNT CHECK
    ============================================
    */

    if (
      user.isBlock === true
    ) {
      return res
        .status(403)
        .json({
          message:
            "Your account has been blocked. Please contact Velmora support.",
        });
    }

    /*
    ============================================
    CREATE JWT
    ============================================
    */

    const token =
      jwt.sign(
        {
          email:
            user.email,

          firstName:
            user.firstName,

          lastName:
            user.lastName,

          role:
            user.role,

          img:
            user.img,
        },

        process.env.JWT_KEY
      );

    /*
    ============================================
    SUCCESS
    ============================================
    */

    return res
      .status(200)
      .json({
        message:
          "Login successful",

        role:
          user.role,

        token:
          token,

        user: {
          email:
            user.email,

          firstName:
            user.firstName,

          lastName:
            user.lastName,

          role:
            user.role,

          img:
            user.img,
        },
      });

  } catch (error) {
    console.error(
      "GOOGLE LOGIN ERROR:",
      error.response?.data ||
        error.message
    );

    return res
      .status(500)
      .json({
        message:
          "Google login failed",

        error:
          error.response?.data ||
          error.message,
      });
  }
}



export function getUser(req,res){

  User.find().then((data)=>{
    res.json(data)
  }).catch(()=>{
    res.json({
      message:"The detail is not found"
    })
  })


}

export async function loginUser(req, res) {
  try {
    const email =
      req.body.email;

    const password =
      req.body.password;

    console.log(
      "LOGIN BODY:",
      req.body
    );

    console.log(
      "LOGIN EMAIL:",
      JSON.stringify(
        req.body.email
      )
    );

    if (
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          message:
            "Email and password are required",
        });
    }

    /*
    ============================================
    FIND USER
    ============================================
    */

    const user =
      await User.findOne({
        email: email,
      });

    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "The user not found",
        });
    }

    console.log(
      "LOGIN FOUND USER:",
      user.email
    );

    /*
    ============================================
    BLOCKED ACCOUNT CHECK
    ============================================
    */

    if (
      user.isBlock === true
    ) {
      return res
        .status(403)
        .json({
          message:
            "Your account has been blocked. Please contact Velmora support.",
        });
    }

    /*
    ============================================
    PASSWORD CHECK
    ============================================
    */

    const isPasswordCorrect =
      bcrypt.compareSync(
        password,
        user.password
      );

    if (
      !isPasswordCorrect
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid password",
        });
    }

    /*
    ============================================
    CREATE TOKEN
    ============================================
    */

    const token =
      jwt.sign(
        {
          email:
            user.email,

          firstName:
            user.firstName,

          lastName:
            user.lastName,

          role:
            user.role,

          img:
            user.img,
        },

        process.env.JWT_KEY
      );

    return res
      .status(200)
      .json({
        message:
          "Login successful",

        token:
          token,

        role:
          user.role,
      });

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "Login failed",

        error:
          error.message,
      });
  }
}





export function isAdmin(req){

  if(req.user == null){
return false;



  }

  if(req.user.role != "admin"){
   
    return  false;

  }
return true;


}

export function getUsers(req,res){
  if(req.user==null){
    res.status(401).json({
      message:"You are not authorized to access this resouece"

    })
  }else{
    res.json({
      ...req.user,
    })
  }
}



export async function resetPassword(req, res) {
  try {
    console.log("RESET PASSWORD BODY:", req.body);

    const { email, otp, newPassword } = req.body;

   
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required"
      });
    }

   
    const user = await User.findOne({
      email: email
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const otpData = await OTP.findOne({
      email: email
    });

    if (!otpData) {
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP."
      });
    }

    console.log("Stored OTP:", otpData.otp);
    console.log("Received OTP:", otp);

   
    if (Number(otpData.otp) !== Number(otp)) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

   
    user.password = hashedPassword;

    await user.save();

    // 7. Delete OTP after successful password reset
    await OTP.deleteMany({
      email: email
    });

    console.log("Password reset successful for:", email);

    
    return res.status(200).json({
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}


const transport = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

export async function sendOtp(req, res) {
  try {


    const email = req.body.email?.trim();

    console.log("OTP REQUEST EMAIL:", email);

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }


    const user = await User.findOne({
      email: email
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found!"
      });
    }

    console.log(
      "USER FOUND:",
      user.email
    );



    const randomOtp =
      Math.floor(
        100000 +
        Math.random() * 900000
      );

    

  const message = {
  from: `"VELMORA" <${process.env.EMAIL}>`,

  to: email,

  subject: "Your VELMORA verification code",

  text: `
Hello ${user.firstName || "Customer"},

Your password reset verification code is:

${randomOtp}

This code was requested for your VELMORA account.

Do not share this code with anyone.

If you did not request a password reset, you can safely ignore this email.

VELMORA
  `,

  html: `
    <div style="
      max-width: 520px;
      margin: auto;
      font-family: Arial, sans-serif;
      color: #333333;
    ">

      <h2>
        Password Reset
      </h2>

      <p>
        Hello ${user.firstName || "Customer"},
      </p>

      <p>
        Use the following verification code
        to reset your VELMORA password.
      </p>

      <div style="
        margin: 30px 0;
        padding: 20px;
        background: #f7f7f7;
        border-radius: 10px;
        text-align: center;
      ">

        <div style="
          font-size: 12px;
          margin-bottom: 8px;
        ">
          VERIFICATION CODE
        </div>

        <strong style="
          font-size: 32px;
          letter-spacing: 6px;
        ">
          ${randomOtp}
        </strong>

      </div>

      <p>
        Do not share this code with anyone.
      </p>

      <p>
        If you did not request a password reset,
        you can safely ignore this email.
      </p>

      <p>
        

      velmora beauty products 
      </p>

    </div>
  `
};

   

    const info =
      await transport.sendMail(
        message
      );

   

    console.log(
      "=============================="
    );

    console.log(
      "OTP EMAIL RESULT"
    );

    console.log(
      "TO:",
      email
    );

    console.log(
      "MESSAGE ID:",
      info.messageId
    );

    console.log(
      "ACCEPTED:",
      info.accepted
    );

    console.log(
      "REJECTED:",
      info.rejected
    );

    console.log(
      "PENDING:",
      info.pending
    );

    console.log(
      "RESPONSE:",
      info.response
    );

    console.log(
      "ENVELOPE:",
      info.envelope
    );

    console.log(
      "=============================="
    );



    await OTP.deleteMany({
      email: email
    });

    const otpData = new OTP({
      email: email,
      otp: randomOtp
    });

    await otpData.save();

    return res.status(200).json({
      message:
        "OTP sent successfully"
    });

  } catch (error) {
    console.error(
      "OTP SENDING ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to send OTP",

      error:
        error.message
    });
  }
}



//contact message 


export async function sendContactMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      // YOUR PRODUCT SALES EMAIL
      from: `"Beauty Store Website" <${process.env.EMAIL}>`,

      // MAIL COMES TO SAME PRODUCT SALES EMAIL
      to: process.env.EMAIL,

      // WHEN YOU PRESS REPLY -> CUSTOMER EMAIL
      replyTo: email,

      subject: `New Contact Message - ${subject}`,

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            background: #fffafa;
            padding: 30px;
            border-radius: 15px;
          "
        >

          <h2 style="color: #ef4444;">
            New Customer Message
          </h2>

          <p>
            You received a new message from the Beauty Store website.
          </p>

          <hr
            style="
              border: none;
              border-top: 1px solid #eeeeee;
              margin: 20px 0;
            "
          />

          <p>
            <strong>Customer Name:</strong>
            ${name}
          </p>

          <p>
            <strong>Customer Email:</strong>
            ${email}
          </p>

          <p>
            <strong>Subject:</strong>
            ${subject}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <div
            style="
              background: white;
              padding: 15px;
              border-radius: 10px;
              margin-top: 10px;
            "
          >
            ${message}
          </div>

          <p
            style="
              margin-top: 25px;
              color: #64748b;
              font-size: 13px;
            "
          >
            Click Reply to respond directly to ${name}.
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      message: "Message sent successfully",
    });

  } catch (error) {

    console.error(
      "CONTACT EMAIL ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
}

export async function updateUserBlockStatus(req, res) {
  try {
   

    const authorizationHeader =
      req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        message:
          "Authorization token is required",
      });
    }

    if (
      !authorizationHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        message:
          "Invalid authorization format",
      });
    }

    /*
    ============================================
    2. GET TOKEN
    ============================================
    */

    const token =
      authorizationHeader
        .substring(7)
        .trim();

    if (!token) {
      return res.status(401).json({
        message:
          "Authentication token is missing",
      });
    }

    /*
    ============================================
    3. VERIFY TOKEN
    ============================================
    */

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_KEY
      );
    } catch (error) {
      console.error(
        "BLOCK USER TOKEN ERROR:",
        error.message
      );

      if (
        error.name ===
        "TokenExpiredError"
      ) {
        return res.status(401).json({
          message:
            "Your login session has expired",
        });
      }

      

      return res.status(401).json({
        message:
          "Invalid authentication token",
      });
    }

    /*
    ============================================
    4. FIND LOGGED USER
    ============================================
    */

    if (
      !decoded ||
      !decoded.email
    ) {
      return res.status(401).json({
        message:
          "Invalid authentication token",
      });
    }

    const loggedUser =
      await User.findOne({
        email:
          decoded.email,
      });

    if (!loggedUser) {
      return res.status(404).json({
        message:
          "Logged user account not found",
      });
    }

    /*
    ============================================
    5. CHECK LOGGED USER IS BLOCKED
    ============================================
    */

    if (loggedUser.isBlock) {
      return res.status(403).json({
        message:
          "Your account is currently blocked",
      });
    }

    /*
    ============================================
    6. ADMIN CHECK
    ============================================
    */

    if (
      loggedUser.role !==
      "admin"
    ) {
      return res.status(403).json({
        message:
          "Only administrators can manage account access",
      });
    }

    /*
    ============================================
    7. GET TARGET USER
    ============================================
    */

    const userId =
      req.params.userId;

    if (!userId) {
      return res.status(400).json({
        message:
          "User ID is required",
      });
    }

    const targetUser =
      await User.findById(
        userId
      );

    if (!targetUser) {
      return res.status(404).json({
        message:
          "User account not found",
      });
    }

    /*
    ============================================
    8. GET NEW BLOCK STATUS
    ============================================
    */

    const {
      isBlock,
    } = req.body;

    if (
      typeof isBlock !==
      "boolean"
    ) {
      return res.status(400).json({
        message:
          "isBlock must be true or false",
      });
    }

    /*
    ============================================
    9. OPTIONAL SAFETY:
       ADMIN CANNOT BLOCK HIMSELF
    ============================================
    */

    if (
      String(loggedUser._id) ===
      String(targetUser._id)
    ) {
      return res.status(400).json({
        message:
          "You cannot block your own administrator account",
      });
    }

    /*
    ============================================
    10. UPDATE USER
    ============================================
    */

    targetUser.isBlock =
      isBlock;

    await targetUser.save();

    /*
    ============================================
    11. SUCCESS RESPONSE
    ============================================
    */

    return res.status(200).json({
      message:
        isBlock
          ? "User blocked successfully"
          : "User access restored successfully",

      user: {
        _id:
          targetUser._id,

        firstName:
          targetUser.firstName,

        lastName:
          targetUser.lastName,

        email:
          targetUser.email,

        role:
          targetUser.role,

        isBlock:
          targetUser.isBlock,

        img:
          targetUser.img,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE USER BLOCK STATUS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update account access",

      error:
        error.message,
    });
  }
}