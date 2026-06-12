const { re } = require('mathjs')
const userModel=require('../models/user.model')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const tokenBlacklistModel=require('../models/blacklist.model')


//register
async function registerUserController(req,res){
    const {username, email, password}= req.body

    if(!username || !email || !password){
        return res.status(400).json({
            message:"Please enter the details"
        })
    }

    const userAlreadyExist= await userModel.findOne({
        $or:[{username},{email}]
    })
    if(userAlreadyExist){
        return res.status(400).json({
            message:"User already exist"
        })
    }

    const hashedPassword= await bcrypt.hash(password,10)

    const user= await userModel.create({
        username,
        email,
        password:hashedPassword
    })

    const token=jwt.sign(
        {
            id:user._id,
            username
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn:"1d"
        }
    )

    res.cookie("token",token)

    res.status(200).json({
        message:"User Registered Successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email 
        }
    })

}

//login
async function loginUserController(req,res){
    const {email,password}=req.body

    const user=await userModel.findOne({email})
    if(!user){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }

    const isPasswordValid=await bcrypt.compare(password, user.password)
    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }

    const token=jwt.sign(
        {
            id:user._id,
            username:user.username
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn:"1d"
        }
    )

    res.cookie("token",token)
    res.status(200).json({
        message:"User Loggedin Successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email 
        }
    })
} 

//logout
async function logoutUserController(req,res){
    console.log("Token:", req.cookies.token);
    const token=req.cookies.token
    
    if(token){
        await tokenBlacklistModel.create({token})
    }
    res.clearCookie("token")

    res.status(200).json({
        message:"User logout successfully"
    })
}

module.exports={registerUserController, loginUserController,logoutUserController}