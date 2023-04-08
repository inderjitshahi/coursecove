import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 5000;

const app = express();

app.listen(PORT,console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`));