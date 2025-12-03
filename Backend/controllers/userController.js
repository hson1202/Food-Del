import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import { response } from "express";


//login user
const loginUser = async (req,res)=>{
    const {email,password}=req.body;
    try {
        console.log("Email received:", email)
        const user =await userModel.findOne({email});
        console.log("User found:", user)
        if (!user) {
            return res.json({success:false,message:"User Doesn't exists"})
        }
        const isMatch= await bcrypt.compare(password,user.password)
        console.log("Password match:", isMatch)

        if (!isMatch) {
            return res.json({success:false,message:"Invalid Credentials"})
        }
        const token=createToken(user._id);
        res.json({success:true,token})


    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message || "Error"})
    }
}
const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024-food-delivery-admin-panel')
}

//register user
const registerUser = async (req,res)=>{
    const {name ,password,email}=req.body;
    try {
        //checking use exits or not
        const exists=await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message:"User already exists"})
        }
        // validateing email and password
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please Enter a valid E-mail"})
        }
        if(password.length<8){
            return res.json({success:false,message:"Please enter a strong password"})
        }

        //hashing user password
        const salt= await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        const user = await newUser.save()
        const token= createToken(user._id)
        res.json({success:true,token})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message || "Error"})
    }
}

//verify token
const verifyToken = async (req, res) => {
    try {
        // Token được lấy từ authMiddleware (đã verify và decode)
        const userId = req.body.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        // Lấy thông tin user từ database
        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Kiểm tra user có active không
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });
        }

        // Trả về thông tin user (không bao gồm password)
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error("Verify token error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export {loginUser, registerUser, verifyToken};