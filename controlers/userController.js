import User from "../models/user.js";
import bcrypt from "bcrypt";

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