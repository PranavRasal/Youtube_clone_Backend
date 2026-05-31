import {asyncHandler } from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadonCloudinary} from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';

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
         const coverImageLocalPath = req.files?.coverImage?.[0]?.path ;


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
               coverImage : coverImage?.url 
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

export { registerUser }