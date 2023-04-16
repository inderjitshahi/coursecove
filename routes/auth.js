import express from 'express';
import {
    forgotPassword,
    getMe,
    login,
    logout,
    register,
    resetPassword,
    updateDetails,
    updatePassword
} from '../controllers/auth.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;