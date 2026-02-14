import express from 'express';
import { getUsers, getUserDetails, deleteUser, toggleUserBan } from '../controllers/adminUserController';
import { adminAuth } from '../middlewares/adminMiddleware';

const router = express.Router();

router.get('/', adminAuth, getUsers);
router.get('/:id', adminAuth, getUserDetails);
router.delete('/:id', adminAuth, deleteUser);
router.put('/:id/ban', adminAuth, toggleUserBan);

export default router;
