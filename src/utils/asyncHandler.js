


// const asyncHnadler = (Handler)=>{
//     (req , res , next) =>{
//         Promise.resolve(Handler(req , res , next))
//         .catch((error)=>{
//             next(error);
//         })
//     }
// }


const asyncHandler = (Handler) => async (req, res, next) => {
    try{
        await Handler(req, res, next);
    }
     catch(error){
            res.status(error.code || 500).json({
                success : false,
                message : error.message || "some error occurred"
            })
        } 

}


export { asyncHandler };