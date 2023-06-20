import express from 'express';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { connectDB } from './config/db.js'
import errorHandler from './middlewares/error.js';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import path from 'path';
import dir_name from './dirname.js';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors'
//Load Env variables
dotenv.config({ path: './config/config.env' });


//Route Files, **add file extension
import bootcamps from './routes/bootcamp.js'
import courses from './routes/courses.js'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import reviewRouter from './routes/reviews.js'


//Connect to DataBase
connectDB();

//Port
const PORT = process.env.PORT || 5000;

//Initialize the app
const app = express();

//Middlewares---------------------
//a function that has access to req, res life-cycle

//Body Parser Middleware
app.use(express.json());

//Cookie Parser
app.use(cookieParser());

//Morgan Middleware,
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//File Upload
app.use(fileUpload());

//Sanitize Data, from no sql injection
app.use(mongoSanitize());

//Add Securities headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate Limiting
const limiter=rateLimit({
    windowMs:10*60*1000,//10min
    max:400
})
app.use(limiter);

//Prevent  http param pollution
app.use(hpp());

//Enable Cors
app.use(cors());

// Set static folder
app.use(express.static(path.join(dir_name,'public')));

//Mount Routers------------------
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/auth/users',usersRouter);
app.use('/api/v1/reviews',reviewRouter);


//Error handler middleware, must be after Routers Mount,so that errors returned from routes can be handled
app.use(errorHandler);

app.get('/', (req, res) => {
    //express automatically sets content-type like: application/json; charset=utf-8 or text/html for simple string

    res.send("Hello From Express");

    res.send({
        name: "inderjit",
    })
    // or res.json({name:"inderjit"})

    res.sendStatus(400);
    // or res.status(400).send({success:false})
    // or res.status(200).send({success:true,data:{id:123}})
});

const server = app.listen(PORT, console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`));

//Globally Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //close the server and exit process
    server.close(() => process.exit(1));
})
