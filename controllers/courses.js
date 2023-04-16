import Course from '../models/Course.js'
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middlewares/async.js';
import Bootcamp from '../models/Bootcamp.js';
import { query } from 'express';

// @desc Get All Courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public

export const getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults);
    }
});


// @desc Get single Courses
// @route GET /api/v1/courses/:id
// @access Public

export const getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description',
    });
    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404))
    }
    res.status(200).json({
        success: true,
        data: course
    })
});


// @desc Add a Courses
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private

export const addCourse = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`, 404))
    }

    //bootcamp can updated by only owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401));
    }

    const course = await Course.create(req.body);
    res.status(200).json({
        success: true,
        data: course
    })
});


// @desc Update a Courses
// @route PUT /api/v1/courses/:id
// @access Private

export const updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404))
    }

    //bootcamp can updated by only owner
    if (course?.user !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update course ${course._id}`, 401));
    }

    course = await Course.updateOne({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: course
    })
});


// @desc Add a Courses
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private

export const deleteCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    //bootcamp can updated by only owner
    if (course?.user !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete course ${course._id}`, 401));
    }
    await Course.deleteOne({ _id: req.params.id });
    res.status(200).json({
        success: true,
        data: {}
    })
});

