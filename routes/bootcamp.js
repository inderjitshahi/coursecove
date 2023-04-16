import express from "express";
import { bootcampPhotoUpload, createBootcamp, deleteBootcamp, getBootcamp, getBootcamps, updateBootcamp } from "../controllers/bootcamps.js";
import { protect, authorize } from "../middlewares/auth.js";
//Include other resource routers
import courseRouter from './courses.js'
import reviewRouter from './reviews.js'
import advancedResults from "../middlewares/advancedResult.js";
import Bootcamp from "../models/Bootcamp.js";

const router = express.Router();

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

// router.get('/', getBootcamps);


// router.get('/:id', getBootcamp)


// router.post('/', createBootcamp)


// router.put('/:id', updateBootcamp)


// router.delete('/:id', deleteBootcamp)

//OR

// Note: authorize is to called after protect, as req.user is set in protect middleware
router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp); //Passing middleware along with controller
router.route('/:id').get(getBootcamp).put(protect, authorize('publisher', 'admin'), updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp);
router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

export default router;

