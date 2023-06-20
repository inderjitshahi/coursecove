import mongoose from "mongoose";
export const connectDB= async()=>{
    const connection=await mongoose.connect(process.env.MONGODB_URI,{
        useNewUrlParser:true,
        useUnifiedTopology: true,
    });
    console.log(`DB connected`);
    // console.log(`DB connected: ${connection.connection.host}`);
}