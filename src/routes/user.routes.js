import { Router } from 'express';

const router = Router();

// Controllers import
import { registerUser } from '../controllers/user.controller.js';

// Routes
router.route("/register").post(registerUser);

export default router ;