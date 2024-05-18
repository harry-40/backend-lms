import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken';

const isLoggedIn = async(req , res, next) =>{
    const {token} = req.cookies;

    if(!token){
        return next(new AppError('Unauthnticated ,Please login again',400))
    }

    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;

    next();
}


const authrizedRoles = (...roles) => async (req,res,next)=>{
    const currentUserRole = req.user.role;
    if(!roles.includes(currentUserRole)){
     return  next(
        new AppError('You do not have permission to  this route',403)
     )

}
next();

}

const authrizeSubscriber = async(req,res,next)=>{
    const subscription = req.user.subscription;
    const currentUserRole= req.user.role;
    if(currentUserRole !== 'ADMIN' && subscription.status !== 'active'){
        return next(
            new AppError('Please subscribe to acccess this route',403)
        )
    }

}

export{
    isLoggedIn,
    authrizedRoles,
    authrizeSubscriber
    
}