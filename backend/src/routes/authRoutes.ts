import express from 'express';
import { registerUser, loginUser, getUserProfile, updateProfilePic, setPredefinedAvatar, forgotPassword, resetPassword, verifyOTP } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/update-profile-pic', protect, upload.single('image'), updateProfilePic);
router.put('/set-avatar', protect, setPredefinedAvatar);

export default router;
