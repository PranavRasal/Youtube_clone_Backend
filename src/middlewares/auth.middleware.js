import {asyncHandler} from '../utils/asyncHandler.js';
import {apiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken';
import {User} from '../models/user.model.js';


export const verifyJWT = asyncHandler(async(req ,  _, next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer" , "") ;

    if(!token){
        throw new apiError(401 , "unauthorized , no token provided") ;
    }

    const decoded = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET) ;

    const user = await User.findById(decoded._id).select("-password -refreshToken") ;

    if(!user){
        throw new apiError(401 , "unauthorized , user not found") ;
    }

    req.user = user ;
    next();
    }catch(error){
        throw new apiError(401 , error?.message ||"unauthorized , invalid access token") ;
    }

})