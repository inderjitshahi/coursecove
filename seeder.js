import fs from 'fs';
import mongoose from 'mongoose';
import dir_name from './dirname.js';  //as global __dirname is not available in es-module
import * as dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });


//Load Models
import Bootcamp from './models/Bootcamp.js';
import Course from './models/Course.js';
import User from './models/User.js';


// Connect to Db
import { connectDB } from './config/db.js';
import Review from './models/Review.js';
connectDB();

//Read Json files
const bootcamps = JSON.parse(fs.readFileSync(`${dir_name}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${dir_name}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${dir_name}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${dir_name}/_data/reviews.json`, 'utf-8'));

//Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);
        console.log("Data Imported...");
        process.exit();
    } catch (err) {
        console.error(err);
    }
}


//Delete Data
const DeleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data Destroyed...");
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    DeleteData();
} else {
    process.exit();
}