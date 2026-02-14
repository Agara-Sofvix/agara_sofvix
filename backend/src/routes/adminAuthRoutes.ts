import express from 'express';
import { adminLogin, getAdminProfile, adminLogout, updateAdminProfile, changeAdminPassword } from '../controllers/adminAuthController';
import { adminAuth } from '../middlewares/adminMiddleware';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/profile', adminAuth, getAdminProfile);
router.put('/profile', adminAuth, updateAdminProfile);
router.put('/password', adminAuth, changeAdminPassword);
router.post('/logout', adminAuth, adminLogout);

export default router;
