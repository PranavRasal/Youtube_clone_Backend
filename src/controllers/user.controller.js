import {asyncHandler } from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadonCloudinary} from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessTokenAndRefreshToken = async (userId) =>{
   try{
   
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken ;
      await user.save({validateBeforeSave : false});

      return { accessToken , refreshToken} ;

   }catch(error){
      throw new apiError(500 , "something went to wrong while generating access token and refresh tokrn")
   }

}

const registerUser = asyncHandler( async( req , res)=>{
     // logic to register user
     // get user from frontend 

      const{username , email , password , fullName } = req.body ;
      console.log(username , email)
      
 


     // validate the details 

      if([username , email , password , fullName].some((field)=> 
         field?.trim() === "" )) {
            throw new apiError (400 , "All field are required")
         }


     // check if user already exists : username and email should be unique

         const existingUser = await User.findOne({
            $or : [{username},{email}]
         })

         if(existingUser){
            throw new apiError (409 , "User already exists")
         }

     // check for images and avatar and check avtar

         const avatarLocalPath = req.files?.avatar?.[0]?.path ;
         // const coverImageLocalPath = req.files?.coverImage?.[0]?.path ;
         let coverImageLocalPath ;
         if(req.body && Array.isArray(req.body.coverImage) && 
                     req.body.coverImage.length > 0){
            coverImageLocalPath = req.files.coverImage[0].path ;
            }


            if(!avatarLocalPath){
               throw new apiError (400 , "Avatar is required");
            }

     // upload the image to cloudinary and get the url

            const avatar = await uploadonCloudinary(avatarLocalPath);
            const coverImage = await uploadonCloudinary(coverImageLocalPath);
            if(!avatar){
               throw new apiError (400 , "Avatar is required");
            }

     // create object of user and save it to database

           const user = await User.create({
               username : username.toLowerCase() , 
               email , 
               password ,
               fullName ,
               avatar : avatar.url,
               coverImage : coverImage?.url || ""
            })

     // remove password and refreshTokens field from the response 
     // check user creation 

            const userCreated = await User.findById(user._id).select(
               "-password -refreshToken"
            );

            if(!userCreated){
               throw new apiError (500 , "User creation failed")
            }

     // return response to frontend

   return res.status(201).json(
    new apiResponse(201 , "User created successfully" , userCreated)
   )

})

const loginUser = asyncHandler(async (req , res) =>{
   // for login we need
   // input email and password for user 

   const {email , password} = req.body ;

   if (!email || !password){
      throw new apiError(400 , "Email and password are required");
   }



   // check user are exist or not 

   const user = await User.findOne({
      email 
   })

   if(!user){
      throw new apiError(404 , "User not Found");
   }

   const isPasswordMatch = await user.isPasswordCorrect(password);

   if(!isPasswordMatch){
      throw new apiError(401 , "Invalid credentials")
   }



   // if user exit generate access token and refresh token

   const { accessToken , refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

   const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )


   // send cookies 
   //    // return response to frontend
  
   const option = {
      httpOnly : true ,
      secure : true
   }

   return res
   .status(200)
   .cookie("accessToken" , accessToken , option)
   .cookie("refreshToken" , refreshToken , option)
   .json(
      new apiResponse(
         200 ,
         "User logged in successfully",
         loggedInUser
      )
   )

})

const logoutUser = asyncHandler(async (req , res)=>{
  
   await User.findByIdAndUpdate(
      req.user._id ,
      {
        $set:{
         refreshToken : undefined
        }
   },{
      new : true
   })

   const option = {
      httpOnly : true ,
      secure : true
   }

   return res
   .status(200)
   .clearCookie("accessToken" , option)
   .clearCookie("refreshToken" , option)
   .json(
      new apiResponse(
         200 ,
         "User logged out successfully" ,
         {}
      )
   )
})

const refreshaccessToken = asyncHandler(async(req , res)=>{
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;

   if(!incomingRefreshToken){
      throw new apiError(401 , " unauthorized , no refresh token provided")
   }

   try{
      // verify the refresh token
   const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)

   // check user exist or not
   const user = await User.findById(decodedToken?._id);

   if(!user){
      throw new apiError(404 , " user not found")
   }

   // check refresh token match or not
   if(user.refreshToken !== incomingRefreshToken){
      throw new apiError(401 , "unauthorized , invalid refresh token")
   }

   // generate new access token and refresh token

   const { accessToken , newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

   const option ={
      httpOnly : true ,
      secure : true
   }

   // return response to frontend
   return res
   .status(200)
   .cookie("accessToken" , accessToken , option)
   .cookie("refreshToken" , newRefreshToken , option)
   .json(
      new apiResponse(
         200 ,
         "Access token refreshed successfully",
         {
            accessToken ,
           refreshToken : newRefreshToken 
         }
      )
   )
   }catch(error){
      throw new apiError(401 , error?.message || "Unauthorized , invalid refresh token")
   }

})

const changeCurrentUserPassword = asyncHandler(async(req, res)=>{
   const{oldPassword , newPassword} = req.body ;
    
   const user = await User.findById(req.user._id);

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

   if(!isPasswordCorrect){
      throw new apiError(401 , "Invalid old password")
   }
   user.password = newPassword ;
   await user.save({validateBeforeSave : false});

   return res
   .status(200)
   .json(
      new apiResponse(
         200 ,
         "Password changed successfully",
         {}
      )
   )

})


const getCurrentUSer = asyncHandler(async(req , res)=>{
   // const user = await User.findById(req.user._id).select("-password -refreshToken") ;

   return res
   .status(200)
   .json(
      new apiResponse(
         200 ,
         "User fetched successfully",
         req.user
      )
   )
})

export {
   registerUser ,
   loginUser ,
   logoutUser ,
   refreshaccessToken ,
   changeCurrentUserPassword ,
   getCurrentUSer
   
   }