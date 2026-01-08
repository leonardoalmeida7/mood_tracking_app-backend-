import {  Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import verifyToken from '../helpers/verify-token.js';
import upload from '../config/multer.js';

const router = Router();

router.post('/register', upload.single('profileImage'), UserController.register);
router.post('/login', UserController.login);
router.put('/update', verifyToken, upload.single('profileImage'), UserController.updateProfile);

export default router;