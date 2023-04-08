

// @desc Get All bootcamps
// @route GET /api/v1/bootcamps
// @access Public
export const getBootcamps = (req, res, next) => {
    res.status(200).send({ success: true, message: "Show All Bootcamps",hello:req.hello});

}


// @desc Get single bootcamps
// @route GET /api/v1/bootcamps/:id
// @access Public
export const getBootcamp = (req, res, next) => {
    res.status(200).send({ success: true, message: `Show Bootcamp ${req.params.id}` });
}


// @desc Post bootcamp
// @route POST /api/v1/bootcamps
// @access Private
export const createBootcamp = (req, res, next) => {
    res.status(200).send({ success: true, message: "Create Bootcamp" });
}


// @desc Update  bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
export const updateBootcamp = (req, res, next) => {
    res.status(200).send({ success: true, message: `Update Bootcamp ${req.params.id}` });
}


// @desc Delete single bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
export const deleteBootcamp = (req, res, next) => {
    res.status(200).send({ success: true, message: `Delete Bootcamp ${req.params.id}` });
}