import express from 'express'
import {
    createUser,
    deleteUser,
    getUser,
    getUsers,
    updateUser
} from '../controllers/users.js';
import { authorize, protect } from '../middlewares/auth.js';
import advancedResults from '../middlewares/advancedResult.js';
import User from '../models/User.js';
const router = express.Router();

//all routes below it will use protect and authorize
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User,""), getUsers).post(createUser);
router.route('/:id').get(getUser).delete(deleteUser).put(updateUser);

export default router;