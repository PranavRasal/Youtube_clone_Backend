import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({

    username :{
        type :String ,
        required : true ,
        unique : true ,
        index : true ,
        lowercase : true ,
        trim : true
    },
    
    email:{
        type :String ,
        required : true ,
        unique : true ,
        lowercase : true ,
        trim : true
    },

    fullName:{
        type :String ,
        required : true ,
        trim : true ,
        index : true
    },

    avatar :{
        type : String , //cloudinary url 
        required : true ,
    },

    coverImage :{
        type : String , //cloudinary url 
        default : ""
    },

    watchHistory :[   
        {
            type : Schema.Types.ObjectId ,
            ref : "Video"
        }
    ],

    password :{
        type : String ,
        required :  [true , "Password is required"]
    },

    refreshToken : {
        type : String ,
    }

},{
    timestamps : true
})

// pre save hook to hash the password before saving  the user document to the database 
//  compare the password when we are trying to login the user   


userSchema.pre("save" , async function (){ 
/*  this refers to when we create a new user document or update the password of 
    an existing user document , then only we will hash the password and save it to
    the database with the help of bcrypt package */
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password , 10)
})

userSchema.methods.isPasswordCorrect = async function (password){
    // this refers to the user document for which we are checking the password
    return await bcrypt.compare(password , this.password);
}

//jwt package is used to generate access token and refresh token for the user document and
//  we will use the secret key and options from the environment variables to generate 
// the tokens

userSchema.methods.generateAccessToken = function(){ 
/*  this refers to the user document for which we are generating the token with
    the help jwt package we can generate the token by using the sign method of jwt
    and we need to pass the payload and secret key and options like expiresIn */

    return  jwt.sign(
        {   _id : this._id     ,  username : this.username , // payload
            email : this.email , fullName : this.fullName  },

        process.env.ACCESS_TOKEN_SECRET , // secret key

      { expiresIn : process.env.ACCESS_TOKEN_EXPIRES  } // options
    )
}

userSchema.methods.generateRefreshToken = function(){
    // this refers to the user document for which we are generating the token  

    return  jwt.sign(
        {   _id : this._id    // payload 

          },

        process.env.REFRESH_TOKEN_SECRET , // secret key

      { expiresIn : process.env.REFRESH_TOKEN_EXPIRES  } // options
    )
}



export const User = mongoose.model("User" , userSchema)