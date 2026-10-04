import User from "../models/user.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

export function createUser(req,res){


if(req.body.role=="admin"){
  if(req.user!= null){
  
    if(req.user.role!="admin"){
      res.status(403).json({
        message:"you are not authorieze  to create an admin accounts"
      })
      return ;




    }
  
  } 
  else{
    res.status(403).json({
      message:"You are not authorized to create an admin account .please login first"
    });


    return;


  }
}


  const hashedPassword=bcrypt.hashSync(req.body.password,10);


  const user=new User({


  firstName:req.body.firstName,
  lastName:req.body.lastName,
  email:req.body.email,
  password:hashedPassword,
  role:req.body.role,

  });

  user.save().then(()=>{
    res.json({
      message:"The user save and create successfully"
    })
  }).catch(()=>{
    res.json({
      message:"The user account is not created !"
    })
  });









}

// adding google through login
export async function loginWithGoogle(req, res) {
  try {
    const token = req.body.accessToken;

    if (token == null) {
      return res.status(400).json({
        message: "Access Token is required"
      });
    }

    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    console.log(response.data);

    const user= await User.findOne({email:response.data.email});

    if(user==null){

      const newUser=new User({
        email:response.data.email,
        firstName:response.data.given_name,
        lastName:response.data.family_name,
        password:"googleUser",
        img:response.data.picture
        
      });
      await newUser.save();
      const token =jwt.sign({
        email:newUser.email,
        firstName:newUser.firstName,
        lastName:newUser.lastName,
        role:newUser.role,
        img:newUser.img
      },process.env.JWT_KEY);

      res.json({
        message:"Login successfull",
        relo:newUser.role,
        token:token
      })
  

    }
    else{   const token =jwt.sign({
        email:user.email,
        firstName:user.firstName,
        lastName:user.lastName,
        role:user.role,
        img:user.img
      },process.env.JWT_KEY);
      
      res.json({
        message:"Login successfull",
        relo:user.role,
        token:token
      })


    }

    return res.status(200).json({
      message: "Google login successful",
      user: response.data
    });

  } catch (error) {
    console.log(
      "Google login error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Google login failed",
      error: error.response?.data || error.message
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


export function loginUser(req,res){



  const email=req.body.email
  const password=req.body.password

  User.findOne({email:email}).then(
  (user)=>{
    if(user==null){
    res.status(404).json({
      message:"The user not found"
    })

    }else{

      const isPasswordCorrect=bcrypt.compareSync(password,user.password);
if(isPasswordCorrect){
  
  const token =jwt.sign(
      
    {email:user.email,
      firstName:user.firstName,
      lastName:user.lastName,
      role:user.role,
      img:user.img

    }, process.env.JWT_KEY


  )
  res.json({
    message:"Login successful ",
    token:token,
    role:user.role
  })
}

else{
  res.status(401).json({
   message:"Invalid password"



  })
}



    }
  }

  )
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

/*
const transport =nodemailer.createTransport({
  service:"gmail",
  host:"smtp.gmail.com",
  port:587,
  secure:false,
  auth:{
    user:process.env.EMAIL,
    pass:process.env.EMAIL_PASSWORD
  }
})

export async function sendOtp(){

   
  const randomOtp=Math.floor(100000+Math.random()*900000);

const email=req.body.email;
 
if(email==null){
  res.status(400).json({
    message:"Email is required"
    
  });
  return ;

}
const message={
  from:process.env.EMAIL,
  to: email,
  subject: "reseting password for crystal beautt clear",
  text:"this is your password reset OTP : "+randomOtp

}

transport.sendMail(message,(error,infor)=>{
  if(error){
    res.status(500).json({
      message:"Failed send OTP",
      error:error 
        
    })
  }else{
    res.json({
      message:"OTP send successfully ",
      otp:randomOtp
    });
     
  }
} )




}
*/

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
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
      return;

    }




    const user= await User.findOne({
      email:email
    });

    if(user==null){
      res.status(404).json({
        message:"user not found !"
      })
    }

    //delete all otp

    await OTP.deleteMany({
      email:email
    })
;




    
    const randomOtp = Math.floor(
      100000 + Math.random() * 900000
    );

   const message = {
  from: `"Crystal Beauty Clear" <${process.env.EMAIL}>`,
  to: email,
  subject: "Reset Your Password - Crystal Beauty Clear",

  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #fff7f7;
          font-family: Arial, Helvetica, sans-serif;
          color: #1e293b;
        "
      >

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="
            background-color: #fff7f7;
            padding: 40px 15px;
          "
        >
          <tr>
            <td align="center">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  max-width: 600px;
                  background-color: #ffffff;
                  border-radius: 24px;
                  overflow: hidden;
                  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
                "
              >

                <!-- HEADER -->
                <tr>
                  <td
                    style="
                      background: linear-gradient(
                        135deg,
                        #ef4444,
                        #fb7185
                      );
                      padding: 35px 30px;
                      text-align: center;
                    "
                  >

                    <div
                      style="
                        width: 60px;
                        height: 60px;
                        line-height: 60px;
                        margin: 0 auto 15px auto;
                        background-color: rgba(255,255,255,0.18);
                        border-radius: 18px;
                        color: #ffffff;
                        font-size: 28px;
                        font-weight: bold;
                      "
                    >
                      ✦
                    </div>

                    <h1
                      style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 26px;
                        font-weight: 700;
                      "
                    >
                      Password Reset
                    </h1>

                    <p
                      style="
                        margin: 10px 0 0 0;
                        color: #ffe4e6;
                        font-size: 14px;
                      "
                    >
                      Crystal Beauty Clear
                    </p>

                  </td>
                </tr>


                <!-- BODY -->
                <tr>
                  <td
                    style="
                      padding: 35px 30px;
                    "
                  >

                    <p
                      style="
                        margin: 0 0 15px 0;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      Hello,
                    </p>

                    <p
                      style="
                        margin: 0 0 20px 0;
                        color: #64748b;
                        font-size: 15px;
                        line-height: 1.7;
                      "
                    >
                      We received a request to reset the password
                      for your
                      <strong style="color: #1e293b;">
                        Crystal Beauty Clear
                      </strong>
                      account.
                    </p>

                    <p
                      style="
                        margin: 0 0 18px 0;
                        color: #64748b;
                        font-size: 15px;
                        line-height: 1.7;
                      "
                    >
                      Use the verification code below to continue
                      resetting your password.
                    </p>


                    <!-- OTP BOX -->
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      style="
                        margin: 25px 0;
                      "
                    >
                      <tr>
                        <td align="center">

                          <div
                            style="
                              display: inline-block;
                              background-color: #fff1f2;
                              border: 1px solid #fecdd3;
                              border-radius: 18px;
                              padding: 22px 35px;
                            "
                          >

                            <p
                              style="
                                margin: 0 0 8px 0;
                                color: #e11d48;
                                font-size: 12px;
                                font-weight: 700;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                              "
                            >
                              Your OTP Code
                            </p>

                            <p
                              style="
                                margin: 0;
                                color: #be123c;
                                font-size: 38px;
                                font-weight: 800;
                                letter-spacing: 8px;
                              "
                            >
                              ${randomOtp}
                            </p>

                          </div>

                        </td>
                      </tr>
                    </table>


                    <!-- INFO BOX -->
                    <div
                      style="
                        background-color: #f8fafc;
                        border-left: 4px solid #fb7185;
                        border-radius: 12px;
                        padding: 16px 18px;
                        margin-top: 25px;
                      "
                    >

                      <p
                        style="
                          margin: 0;
                          color: #475569;
                          font-size: 14px;
                          line-height: 1.7;
                        "
                      >
                        For your security, never share this code
                        with anyone. Our team will never ask you
                        to provide your OTP.
                      </p>

                    </div>


                    <p
                      style="
                        margin: 25px 0 0 0;
                        color: #64748b;
                        font-size: 14px;
                        line-height: 1.7;
                      "
                    >
                      If you did not request a password reset,
                      you can safely ignore this email. Your
                      account will remain secure.
                    </p>

                    <p
                      style="
                        margin: 28px 0 0 0;
                        color: #1e293b;
                        font-size: 14px;
                        line-height: 1.7;
                      "
                    >
                      Best regards,<br />

                      <strong>
                        Crystal Beauty Clear Team
                      </strong>
                    </p>

                  </td>
                </tr>


                <!-- FOOTER -->
                <tr>
                  <td
                    style="
                      background-color: #fff7f7;
                      padding: 22px 30px;
                      text-align: center;
                      border-top: 1px solid #ffe4e6;
                    "
                  >

                    <p
                      style="
                        margin: 0;
                        color: #94a3b8;
                        font-size: 12px;
                        line-height: 1.6;
                      "
                    >
                      This is an automated security email from
                      Crystal Beauty Clear.
                    </p>

                    <p
                      style="
                        margin: 6px 0 0 0;
                        color: #cbd5e1;
                        font-size: 11px;
                      "
                    >
                      Please do not share your OTP with anyone.
                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
    </html>
  `,
};

    const otp= new OTP({
      email:email,
      otp:randomOtp 
    })
    
    await otp.save();


    const info = await transport.sendMail(message);

    console.log("Email sent:", info.response);
    console.log("Generated OTP:", randomOtp);

    return res.status(200).json({
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error("OTP sending error:", error);

    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message
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