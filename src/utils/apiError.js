class apiError extends Error {
    constructor(
        statusCode , 
        message = "something went to wrong",
        
        errors = [],
        stack = ""
    ){
        super(message);
        this.statusCode = statusCode;
        this.errors = errors ;
        this.stack = stack ;
        this.success = false ;
        this.data = null ;

        if(stack){
            this.stack = stack ;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }

    }
}

export { apiError }