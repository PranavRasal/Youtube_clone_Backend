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

const updateTweet = asyncHandler(async(req , res)=>{
    const { tweetid } = req.params ;
    const { content } = req.body ;

    if(!content.length || content.trim() === ""){
        throw new apiError(400 , "Content is required");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetid,
        { content },
        { new: true }
    )

    if(!tweet){
        throw new apiError(404 , "Tweet not found");
    }

    return res
    .status(200)
    .json(
        new apiResponse(200 , "Tweet updated successfully" , tweet)
    )
})

const deleteTweet = asyncHandler(async(req , res)=>{
    const { tweetid } = req.params ;

    const tweet = await Tweet.findByIdAndDelete(tweetid)

    if(!tweet){
        throw new apiError(404 , "Tweet not found");
    }

    return res
    .status(200)
    .json(
        new apiResponse(200 , "Tweet deleted successfully" , tweet)
    )
})

export {
    createTweet ,
    getAllTweets ,
    updateTweet ,
    deleteTweet
}