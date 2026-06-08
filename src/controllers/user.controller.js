import {asyncHandler } from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import mongoose from 'mongoose';
import {User} from '../models/user.model.js';
import {uploadonCloudinary, deleteFromCloudinary} from '../utils/cloudinary.js';
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
        $unset:{
         refreshToken : 1
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

const updateAccountDetails = asyncHandler(async(req , res)=>{

   const{fullName , username} = req.body ;

   if(!fullName && !username){
      throw new apiError(400 , "At least one field is required to update")
   }
 
   const user = await User.findByIdAndUpdate(
      req.user._id ,
      {
         $set :{
            if(fullNmae){
               fullName : fullName
            },
            if(username){
               username : username.toLowerCase()
            }
         }
      },
      { new : true}
   ).select("-password -refreshToken")

   return res 
   .status(200)
   .json(
      new apiResponse(
         200 ,
         "user profile updated successfully",
         user
      )
   )

})

const updatedUserAvatar = asyncHandler(async (req, res) => {
   const avatarLocalPath = req.file?.path;

   if (!avatarLocalPath) {
      throw new apiError(400, "Avatar image is required");
   }

   const avatar = await uploadonCloudinary(avatarLocalPath);

   if (!avatar?.url) {
      throw new apiError(500, "Something went wrong while uploading avatar on cloudinary");
   }

   // delete old avatar from cloudinary if exist
   const oldAvatarUrl = req.user?.avatar;
   if (oldAvatarUrl) {
   try{
      const oldAvatarPublicId = oldAvatarUrl.split("/").pop().split(".")[0];
      await deleteFromCloudinary(oldAvatarPublicId);
      } catch (error) {
      console.error("Failed to delete old avatar from Cloudinary:", error.message);
   }
   }

   // update user avatar in database and return response to frontend
   const user = await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            avatar: avatar.url
         }
      },
      {
         new: true
      }
   ).select("-password -refreshToken");

   return res.status(200)
   .json(
      new apiResponse(
         200,
         "user avatar updated successfully",
         user
      )
   )

});


const updatedUserCoverImage = asyncHandler(async(req, res)=>{
   
   const coverImageLocalPath = req.file?.path ;

   if(!coverImageLocalPath){
      throw new apiError(400 , "Cover image is required") ;
   }

   const coverImage = await uploadonCloudinary(coverImageLocalPath) ;
   if(!coverImage.url){
      throw new apiError(500 , "Something went wrong while uploading cover Image on cloudinary")
   }

   // delete old cover image from cloudinary if exist
   const oldCoverImageUrl = req.user?.coverImage ;
   if(oldCoverImageUrl){
   try{
      const oldCoverImagePublicId = oldCoverImageUrl.split("/").pop().split(".")[0];

      await deleteFromCloudinary(oldCoverImagePublicId)
   } catch (error) {
         console.error("Failed to delete old cover image from Cloudinary:", error.message);
      }
   }

 // update user cover image in database and return response to frontend
   const user = await User.findByIdAndUpdate(
      req.user._id ,
      {
         $set :{
            coverImage : coverImage.url 
         }
      },
      {
         new : true
      }
   ).select("-password -refreshToken")

   return res
   .status(200)
   .json(
      new apiResponse(
         200,
         "user cover image updated successfully",
         user
      )
   )

})

const getUserChannelProfile = asyncHandler(async(req , res)=>{
   const {username } = req.params ;
   if(!username?.trim()){
      throw new apiError(400 , "Username is required")
   }

   const channel = await User.aggregate([
      {
         $match :{
            username : username.toLowerCase().trim()
         }
      },
      {
         $lookup :{
            from :"subscriptions" ,
            localField :"_id" ,
            foreignField : "channel" ,
            as : "subscribers"
         }
      },{
         $lookup :{
            from : "subscriptions" ,
            localField :"_id" ,
            foreignField : "subscriber" ,
            as : "subscribedTo"
         }
      },{
         $addFields :{
            Subscriber :{
               $size : "$subscribers"
            },
            SubscribedTo :{
               $size : "$subscribedTo"
            },
            isSubscribed : {
               $cond :{
                  if :{
                     $in :[req.user?._id , "$subscribers.subscriber"]
                  },
                  then : true ,
                  else : false
               }
            }
         }
      },
      {
         $project :{
            Subscriber : 1 ,
            SubscribedTo : 1 ,
            isSubscribed : 1 ,
            username : 1 ,
            fullName : 1 ,
            avatar : 1 ,
            coverImage : 1 
         } 
      }
   ])   

   if(!channel?.length || channel?.length  === 0){
      throw new apiError(404 , "Channel not found")
   }

   return res
   .status(200)
   .json(
      new apiResponse(
         200 ,
         "Channel profile fetched successfully",
         channel[0]
      )
   )
   
})


const getWatchHistory = asyncHandler(async(req , res)=>{

   const user = await User.aggregate([
      {
         $match :{
            _id : new mongoose.Types.ObjectId(req.user._id)
         }
      },{
         $lookup :{
            from : "videos",
            localField :"watchHistory" ,
            foreignField : "_id",
            as : "watchHistory",
            pipeline :[
               {
                  $lookup :{
                     from :"users" ,
                     localField :"owner",
                     foreignField :"_id",
                     as :"owner",
                     pipeline :[
                        {
                           $project :{
                              username : 1 ,
                              fullName : 1 ,
                              avatar : 1
                           }
                        }
                     ]
                  }
               },{
                  $addFields :{
                     owner :{
                        $first : "$owner"
                     }
                  }
               }
            ]
         }
      },
   ])

   return res
   .status(200)
   .json(
      new apiResponse(
         200 ,
         "User watch history fetched successfully",
         user[0]?.watchHistory || []
      )
   )
})


export {
   registerUser ,
   loginUser ,
   logoutUser ,
   refreshaccessToken ,
   changeCurrentUserPassword ,
   getCurrentUSer,
   updateAccountDetails,
   updatedUserCoverImage ,
   updatedUserAvatar ,
   getUserChannelProfile ,
   getWatchHistory
   }