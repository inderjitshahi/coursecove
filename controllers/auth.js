import User from "../models/User.js";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middlewares/async.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';

// @desc Register user
// @route POST /api/v1/auth/register
// @access Public

export const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    //Create User
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});



// @desc Register user
// @route POST /api/v1/auth/login
// @access Public

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    //Validate Email and Password
    if (!email || !password) {
        return next(new ErrorResponse(`Please provide all details required for login`, 400));
    }

    //Check for User
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse(`Invalid Credentials !!!`, 401));
    }

    //Check if password matches:
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse(`Invalid Credentials !!!`, 401));
    }

    sendTokenResponse(user, 200, res);

})




// @desc log user out/clear cookie
// @route GET /api/v1/auth/logout
// @access Private
export const logout = asyncHandler(async (req, res, next) => {
    res.cookie('token','none',{
       expires: new Date(Date.now()+10*1000),
       httpOnly:true
    })
    res.status(200).json({
        success: true,
        data: {},
    })
});


// @desc Forgot Password
// @route GET /api/v1/auth/forgotpassword
// @access Public

export const forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorResponse(`Email not registered !!!`, 401));
    }
    //Get Reset Token
    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false })

    //Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this mail because you (or someone else) has requested the reset of a password. Please make PUT request to: \n\n ${resetUrl}
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: `Password reset token`,
            message
        })
        res.status(200).json({ success: true, data: "email sent" })
    } catch (error) {
        console.log(error);
        user.resetPasswordExpiry = undefined;
        user.resetPasswordToken = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorResponse(`Email could not be sent`, 500));
    }


    res.status(200).json({
        success: true,
        data: user
    })
});


// @desc Current logged in user
// @route GET /api/v1/auth/me
// @access Private

export const getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    })
});


// @desc Update user details
// @route GET /api/v1/auth/updatedetails
// @access Private

export const updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: user
    })
});

// @desc update user password
// @route PUT /api/v1/auth/updatepassword
// @access Private

export const updatePassword = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.user.id).select('+password');
    //Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse(`Password is incorrect`, 401));
    }
    user.password = req.body.newPassword;
    await user.save({ validateBeforeSave: true });
    sendTokenResponse(user, 200, res);
});


// @desc Reset password
// @route GET /api/v1/auth/resetpassword/:resettoken
// @access Public

export const resetPassword = asyncHandler(async (req, res, next) => {
    //Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpiry: { $gt: Date.now() }
    });
    if (!user) {
        return next(new ErrorResponse(`Invalid token`, 500));
    }

    //Set new password
    user.password = req.body.password;  //automaticlly hashed by middleware.
    user.resetPasswordExpiry = undefined;
    user.resetPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
});



// Get token from model, create cookie and send response

const sendTokenResponse = async (user, statusCode, res) => {
    //Create Token
    const token = user.getJWTSignedToken();

    //Create cookie
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    //sending both token and cookie, depend on client, whether to store token in local storage or use cookie
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    })
}