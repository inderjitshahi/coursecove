import ErrorResponse from "../utils/ErrorResponse.js";
import asyncHandler from "../middlewares/async.js";
import User from "../models/User.js";
import Bootcamp from "../models/Bootcamp.js";
import Review from "../models/Review.js";



// @desc Get Reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public
export const getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    } else {
        res.status(200).json(res.advancedResults);
    }
});


// @desc Get Single Review
// @route GET /api/v1/reviews/:id
// @access Public
export const getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });
    if (!review) {
        return next(new ErrorResponse(`No review with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: review,
    })
});


// @desc Add review
// @route POST /api/v1/bootcamps/:bootcampId/reviews
// @access Private
export const addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id: ${req.params.bootcampId}`, 404));
    }

    const review = await Review.create(req.body);
    res.status(201).json({
        success: true,
        data: review,
    })
});


// @desc Update review
// @route PUT /api/v1/reviews/:id
// @access Private
export const updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);
    if (!review) {
        return next(new ErrorResponse(`No review with id: ${req.params.id}`, 404));
    }

    //make sure review belongs to user or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User not authorized to update review`, 404));
    }

    await Review.updateOne({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true
    });
    review = await Review.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: review,
    })
});


// @desc Delete review
// @route DELETE /api/v1/reviews/:id
// @access Private
export const deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
        return next(new ErrorResponse(`No review with id: ${req.params.id}`, 404));
    }

    //make sure review belongs to user or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User not authorized to update review`, 404));
    }

    await Review.deleteOne({ _id: req.params.id });
    res.status(201).json({
        success: true,
        data: [],
    })
});