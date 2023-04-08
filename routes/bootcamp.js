import express from "express";
import { createBootcamp, deleteBootcamp, getBootcamp, getBootcamps, updateBootcamp } from "../controllers/bootcamps.js";
const router = express.Router();

// router.get('/', getBootcamps);


// router.get('/:id', getBootcamp)


// router.post('/', createBootcamp)


// router.put('/:id', updateBootcamp)


// router.delete('/:id', deleteBootcamp)

//OR

router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

export default router;

