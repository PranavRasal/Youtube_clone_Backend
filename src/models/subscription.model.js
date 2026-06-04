import  mongoose , { Schema } from "mongoose";

const subscriptionSchema = new Schema({
   subscriber :{
    type : Schema.Types.ObjectId , // user who is subscribing
    ref : "User",
    required : true
   },
   channel:{
    type : Schema.Types.ObjectId , // user who is being subscribed to
    ref : "User" ,
    required : true
   }
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema )