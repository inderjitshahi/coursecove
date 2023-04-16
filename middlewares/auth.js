import jwt from "jsonwebtoken";
import asyncHandler from "./async.js";
import ErrorResponse from "../utils/errorResponse.js";
import User from "../models/User.js";

//Protect Routes
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    //  else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    //Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized for these route', 401));
    }

    try {
        //Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized for these route', 401));
    }

});


//Grant Access to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role: ${req.user.role} is not authorized to access this route`, 403)); //forbidden error
        }
        next();
    }
};
