import {Tweet} from '../models/tweet.model.js';
import {User} from '../models/user.model.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import {apiResponse} from '../utils/apiResponse.js';

const createTweet = asyncHandler(async(req , res)=>{
    const{content} = req.body ;
    

    if(!content.length || content.trim() === ""){
        throw new apiError(400 , "Content is required");
    }
    console.log(content)
    const tweet = await Tweet.create({
        content : content ,
        owner : req.user._id
    })

    return res
    .status(201)
    .json(
        new apiResponse(201 , "Tweet created successfully" , tweet)
    )
})

const getAllTweets = asyncHandler(async(req , res)=>{
    const { userid } = req.params ;
    console.log(userid)

    const tweets = await Tweet.find({ owner: userid }).populate("owner" , "username avatar") ;
    
    
    return res
    .status(200)
    .json(
        new apiResponse(200 , "Tweets retrieved successfully" , tweets)
    )
})

export {
    createTweet ,
    getAllTweets
}