import { verifyJWT } from '../middlewares/auth.middleware.js';
import { Router } from 'express'

const router = Router();

//controllers import
import { createTweet, deleteTweet, getAllTweets, updateTweet } from '../controllers/tweet.controller.js';

// routes
router.use(verifyJWT) // all routes after this middleware will be protected

router.route("/").post(createTweet);
router.route("/user-tweets/:userid").get(getAllTweets);
router.route("/tweet/:tweetid").patch(updateTweet);
router.route("/tweet/:tweetid").delete(deleteTweet);


export default router ;