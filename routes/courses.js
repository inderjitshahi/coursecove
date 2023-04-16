import express from "express";
import { addCourse, deleteCourse, getCourse, getCourses, updateCourse } from "../controllers/courses.js";
import advancedResults from "../middlewares/advancedResult.js";
import Course from "../models/Course.js";
const router = express.Router({ mergeParams: true }); //to allow pass params form  routes passed from other route folder
import { authorize, protect } from "../middlewares/auth.js";

router.route('/').get(advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description'
}), getCourses).post(protect, authorize('publisher', 'admin'), addCourse);
router.route('/:id').get(getCourse).delete(protect, authorize('publisher', 'admin'), deleteCourse).put(protect, authorize('publisher', 'admin'), updateCourse);
export default router;

