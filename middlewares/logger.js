//Middle Ware---------------------
//a function that has access to req, res life-cycle

export const logger = (req, res, next) => {
    // will run for every route request defined below it
    // hello variable inside req will be available to all the routes
    // req.hello = "World";
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    //output: GET http://localhost:5000/api/v1/bootcamps
    next();
}