import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import dns from "dns";

dns.setServers(["1.1.1.1","8.8.8.8"]);

dotenv.config({
    path : './.env'
});

connectDB()
.then(() =>{
 app.listen(process.env.PORT || 5000 , ()=>{
    console.log(`Server is running on the port : ${process.env.PORT || 5000}`); 
 })  
})
.catch((err)=>{
    console.log("Error while connecting to MongoDB:", err);
})