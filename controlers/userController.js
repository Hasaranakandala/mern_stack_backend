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

export async function resetPassword(req,res){

  const otp=req.body.otp;
  const email=req.body.email;

  const newPassword=req.body.newPassword;
const response=OTP.findOne({email:email});
if(response==null){
  res.status(500).json({
    message:"No OTP request found please try again"
  })
}
if(otp==response.otp){
  await OTP.deeleteMany({
    email:email
  })


  const hashPassword=bcrypt.hashSync(newPassword,10);

const response2= await User.updateOne({
  email:email
},{
  password:hashPassword
});
req.json({
  message: "password has been reset successfully !"
})
 
} 
else{
  res.status(403).json({
    message:"OTP are not matching "
  })
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
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password - Crystal Beauty Clear",
     text:`Hello,

We received a request to reset the password for your Crystal Beauty Clear account.

Your One-Time Password (OTP) is:

${randomOtp}

Please use this code to verify your identity and continue resetting your password. This OTP will expire shortly for security reasons.

For your protection, never share this code with anyone. Our team will never ask you for your OTP.

If you did not request a password reset, please ignore this email and your account will remain secure.

Best regards,  
Crystal Beauty Clear Team` 
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