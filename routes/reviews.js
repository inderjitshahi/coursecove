import express from "express";
import advancedResults from "../middlewares/advancedResult.js";
import Review from "../models/Review.js";
const router = express.Router({ mergeParams: true }); //to allow pass params form  routes passed from other route folder
import { authorize, protect } from "../middlewares/auth.js";
import {
    addReview,
    deleteReview,
    getReview,
    getReviews,
    updateReview
} from "../controllers/reviews.js";

router.route('/').get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
}), getReviews).post(protect,authorize('user','admin'),addReview);

router.route('/:id').get(getReview).delete(protect,deleteReview).put(protect,updateReview);



export default router;

