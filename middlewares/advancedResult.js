import Review from "../models/Review.js";

const advancedResults = (model, populate) => async (req, res, next) => {
    const reqQuery = { ...req.query };

    //Fields to remove
    const removeFields = ['select', 'sort', 'page', 'limit']

    //loop over removeFields and delete from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    //Create operators ($gt, $gte, $lt, $lte)
    let query = JSON.stringify(reqQuery);
    query = query.replace(/\b(gt|gte|lt|lte|in)\b/g, match => (`$${match}`));
    query = JSON.parse(query);

    //Finding Resource
    query = model.find(query);

    //Populate Doc
    if(populate){
        query=query.populate(populate);
    }
    
    //Select  Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt')  //-: descending createdAt
    }

    // Pagination
    const count=await Review.countDocuments();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 2;
    const startIndex = (page - 1) * limit;
    const endIndex = (page) * limit;
    const total = await model.countDocuments();
    query = query.skip(startIndex).limit(limit);


    //Pagination Result, Pagination data to response data
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }


    //Executing Query
    const result = await query;
    res.advancedResults={
        success:true,
        count,
        pagination,
        data:result
    }

    next();
}

export default advancedResults;