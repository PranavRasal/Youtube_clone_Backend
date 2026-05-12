import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () =>{
    try {
        const connectionInstance =   await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
        console.log(`database connected !! host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("some error occurred",error);
        process.exit(1);
    }
}

export default connectDB ;