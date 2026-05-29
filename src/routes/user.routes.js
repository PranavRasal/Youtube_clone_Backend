import { Router } from 'express';
import {upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Controllers import
import { registerUser } from '../controllers/user.controller.js';

// Routes
router.route("/register").post(
    upload.fields([
        {
            name : "avatar" ,
            maxCount : 1
        },{
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
);

export default router ;