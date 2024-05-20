import {Router} from 'express';
import { logout,login,register,getProfile,forgotPassword,resetPassword,changePassword ,updateUser} from '../controllers/user.controller.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

router.post('/register',upload.single("avatar"), register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/me',isLoggedIn,getProfile);
router.post('/reset', forgotPassword);
router.post('/reset/:resetToken', resetPassword);
router.post('/change-password',isLoggedIn,changePassword);
router.put('/upload/:id',isLoggedIn, upload.single("avatar"),updateUser);


export default router;