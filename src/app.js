import cors from "cors" ;
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin : process.env.ORIGIN_CORS,
    credentials : true 
}))

app.use(express.json({ limit : "16kb" }));
app.use(express.urlencoded({ extended : true}))
app.use(express.static("public"));


app.use(cookieParser());

// Routes import
import userRouter from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js";


//Routes 
app.use("/api/v1/users" , userRouter) ;
app.use("/api/v1/tweets" , tweetRouter) ;

export { app };