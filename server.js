import express from 'express';
import * as dotenv from 'dotenv';
import morgan from 'morgan';
//Route Files, **add file extension
import bootcamps from './routes/bootcamp.js'

import { logger } from './middlewares/logger.js';



dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 5000;


const app = express();



//Middlewares---------------------
//a function that has access to req, res life-cycle

if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'));
}



//Mount Routers------------------

app.use('/api/v1/bootcamps', bootcamps);





//--------------------------------

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

app.listen(PORT, console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`));