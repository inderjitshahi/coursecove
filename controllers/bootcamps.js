import Bootcamp from '../models/Bootcamp.js'
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middlewares/async.js';
import path from 'path'

// @desc Get All bootcamps
// @route GET /api/v1/bootcamps
// @access Public
export const getBootcamps = asyncHandler(async (req, res, next) => {
    //All Code in single advancedResults middleware
    res.status(200).json(res.advancedResults);
});


// @desc Get single bootcamps
// @route GET /api/v1/bootcamps/:id
// @access Public
export const getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(err);
    }
    res.status(200).json({
        success: true,
        data: bootcamp,
    })
    // catch (err) {
    //     // res.status(400).json({
    //     //     success: false
    //     // })
    //     next(err);
    //     // next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
});


// @desc Post bootcamp
// @route POST /api/v1/bootcamps
// @access Private
export const createBootcamp = asyncHandler(async (req, res, next) => {
    // console.log(req.body);
    // res.status(200).send({ success: true, message: "Create Bootcamp" });

    // Add user to body
    req.body.user = req.user.id;

    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // if the user is not an admin, they can add only one bootcamp
    if (publishedBootcamp && req.user.role != 'admin') {
        return next(new ErrorResponse(`The user with id ${req.user.id} has already published a bootcamp`, 400));
    }

    const bootcamp = await Bootcamp.create(req.body); //return the data created
    res.status(201).json({
        success: true,
        data: bootcamp
    })
});


// @desc Update  bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
export const updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id: ${req.params.id}`, 404));
    }
    //bootcamp can updated by only owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
    }

    //update details of bootcamp
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })


    res.status(200).json({
        success: true,
        data: bootcamp
    })
});


// @desc Delete single bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
export const deleteBootcamp = asyncHandler(async (req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id);


    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id: ${req.params.id}`, 404))
    }

    //bootcamp can updated by only owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
    }

    bootcamp = await Bootcamp.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        data: {}
    })
});


// @desc upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
export const bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id: ${req.params.id}`, 404))
    }

    //bootcamp can updated by only owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please Upload a file`, 400));
    }
    const { file } = req.files;
    // console.log(file);

    //Make Sure Image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please Upload a Image Only file`, 400));
    }

    //Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please Upload a Image with size less than ${process.env.MAX_FILE_UPLOAD / 1000}KB`, 400));
    }

    //Create Custom File Name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
        res.status(200).json({
            success: true,
            data: file.name,
        })
    });
});