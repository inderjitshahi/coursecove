import ErrorResponse from "../utils/ErrorResponse.js";

const errorHandler = (err, req, res, next) => {
    let error={...err}
    error.message=err.message;
     
    //log to console for dev
    // console.log(err);

    //Mongoose Bad objectId
    if(err.name==='CastError'){
        const message=`Resource not found`;
        error=new ErrorResponse(message,404);
    }

    //Mongoose duplicate key error
    if(err.code===11000){
        const message=`Duplicate field value entered`;
        error=new ErrorResponse(message,400);
    }

    //Mongoose validation error
    if(err.name==='ValidatorError'){
        const message=Object.values(err.errors).map(val=>val.message);
        error=new ErrorResponse(message,400);
    }

    // console.log("Name:: ",error.name);
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error",
    });
}

export default errorHandler;