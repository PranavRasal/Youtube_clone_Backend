import {asyncHandler } from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';

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

         const existingUser = User.findOne({
            $or : [{username},{email}]
         })

         if(existingUser){
            throw new apiError (409 , "User is already exists")
         }

     // check for images and avatar
     // upload the image to cloudinary and get the url
     // create object of user and save it to database
     // remove password and refreshTokens field from the response 
     // check user creation 
     // return response to frontend
})

export { registerUser }