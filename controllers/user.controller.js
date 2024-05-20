import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';


const cookieOption={
    maxAge:7*24*60*60*1000, // 7 days
    httpOnly:true,
    secure:true

}


// Register  
// const register = async(req,res,next)=>
//     {

//     const {fullName,email,password}= req.body;


//      // Check if user misses any fields
//     if(!fullName || !email ||  !password){
//         return next( new AppError ('All feilds are required ', 404));
//     }


//       // Check if the user already exists
//     const userExists = await User.findOne({email});

//     if(userExists){
//         return next( new AppError ('Email already exists ', 404));


//     }

//       // Save user in the database and log the user in
//     const user = await User.create({
//         fullName,
//         email,
//         password,
//         avatar:{
//             public_id:email,
//             secure_url:"https://res.cloudinary.com/private-demo/image/upload/yellow_tulip.jpg"
//         }

       
//     });
//     if (!user) {
//         return next(new AppError("User registration failed, please try again", 400));
//     }

//     // TODO:FILe upload

//     if(req.file){
//         console.log(req.file)
//         try{
//             const  result = cloudinary.v2.uploader.upload(req.file.path,{
//                 flder:'lms',
//                 width:'250',
//                 height:'250',
//                 gravity:'faces',
//                 crop:'fill'
//             });
//             if(result){
//                user.avatar.public_id = result.public_id;
//                user.avatar.secure_url =  result.secure_url;

               
//              // Remove the file from the server
//              fs.rm(`uploads/${req.file.filename}`);

//             }

//         }catch(e){
//             return next(new AppError(e.message || "File not uploaded, please try again", 500));

//         }

//     }



//     await user.save();

//     user.password= undefined;

//     const token = await user.generateJWTToken();
//     res.cookie('token' ,token, cookieOption)
    
    

//     res.status(201).json({
//         success:true,
//         message:'USer resgitered successfully',
//         user,
//     })

// };


const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if user misses any fields
        if (!fullName || !email || !password) {
            return next(new AppError("All fields are required", 400));
        }

        // Check if the user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return next(new AppError("Email already exists, please login", 400));
        }

        // Save user in the database and log the user in
        const user = await User.create({
            fullName,
            email,
            password,
            avatar: {
                public_id: email,
                secure_url: " ",
            },
        });

        if (!user) {
            return next(new AppError("User registration failed, please try again", 400));
        }

        // File upload
        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "Learning-Management-System",
                    width: 250,
                    height: 250,
                    gravity: "faces",
                    crop: "fill",
                });

                if (result) {
                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;

                    // Remove the file from the server
                    fs.rmSync(`uploads/${req.file.filename}`);
                }
            } catch (e) {
                return next(new AppError(e.message || "File not uploaded, please try again", 500));
            }
        }

        await user.save();

        user.password = undefined;

        const token = await user.generateJWTToken();

        res.cookie("token", token, cookieOption);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};



// Login
const login= async(req,res,next)=>{

    try{

        
    const {email,password} = req.body;

  // check if user miss any field


    if(!email || !password){
        return next(new AppError('All feild are required',400));
    }

    const user = await User.findOne({
        email
    }).select('+password');

    if(!user || !user.comparePassword(password)){
        return next(new AppError('Email or password does not match',400))
    }
    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie('token',token, cookieOption);

    res.status(200).json({
       success:true,
       message:'User loggedin successfully',
       user, 
    });


}


    
    catch(e){
        return next(new AppError(e.message,500));

    }
};

const logout=(req,res)=>{

    res.cookie('token' , null,{
        secure:true,
        maxAge:0,
        httpOnly:true

    });

    res.status(200).json({
        success:true,
        message:'User logged out successfully'
    })

};

const getProfile= async(req,res)=>{

    try{
        
    const useId = req.user.id;
    const user = await User.findById(useId);

    res.status(200).json({
        success:true,
        message:'User details',
        user
    });

    }catch(e){

        return next(new AppError('Failed to fetch profile',500))

    }
}
    //forgot password

    const forgotPassword = async(req,res,next)=>
        {
        const{email}=req.body;

         // check if user does'nt pass email
        if(!email){
            return next(new AppError('Emai is required',400));
        }
        const user = await User.findOne({email});
        // check if user not registered with the email

        if(!user){
            return next(new AppError('Email not registered', 400))
        };

        const resetToken = await user.generatePasswordResetToken();

        await user.save();

        const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail(email, subject, message);
    
            res.status(200).json({
                success: true,
                message: `Reset password token has been sent to ${email}`,
            });
        } catch (e) {
            user.forgotPasswordExpiry = undefined;
            user.forgotPasswordToken = undefined;
            await user.save();
            return next(new AppError(e.message, 500));
        }

    }





const resetPassword= async(req,res,next)=>{
    const {resetToken}=req.params;
    const {password}=req.body;


    const forgotPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry:{$gt:Date.now()}
    });

    if(!user){
        return next(
            new AppError('Token is Invalid or expired , please try again ', 400)


        )
    }

    user.password = password;

    user.save();
    user.forgotPasswordToken= undefined;
    user.forgotPasswordExpiry = undefined;

    user.save();

    res.status(200).json({
        success:true,
        message:'Password changed successfully'
    })

}


// change password
const changePassword = async(req,res,next)=>{
    const {oldPassword,newPassword} = req.body;
    const{id} = req.user;

    if(!oldPassword || !newPassword){
        return next(
            new AppError('All fields are mandetory',400)


        )

    }

    const user = await user.findOne(id).select('+password');

    if(!user){
        return next(
            new AppError('User does not exist',400)

        )
    }
     const isPasswordvalid = await user.comparePassword(oldPassword);

     if(!isPasswordvalid){
        return next(
            new AppError('Invalid old password',400)

        )
     }
     user.password  = newPassword;

     await user.save();

     user.password = undefined;

     res.status(200).json({
        success:true,
        mesage:'Password changed successfully'
     });
   


}

const updateUser = async(req,res)=>{

    const {fullName} = req.body;
    const {id} = req.user.id;
    
    const user = await userfindById(id);

    if(!user){
        return next(
            new AppError('User doe not exist',400)
        )
    }

    if(req.fullName){
        user.fullName = fullName;
    }

    if(req.file){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        try{
            const  result = cloudinary.v2.uploader.upload(req.file.path,{
                flder:'lms',
                width:'250',
                height:'250',
                gravity:'faces',
                crop:'fill'
            });
            if(result){
               user.avatar.public_id = result.public_id;
               user.avatar.secure_url =  result.secure_url;

               
             // Remove the file from the server
             fs.rm(`uploads/${req.file.filename}`);

            }

        }catch(e){
            return next(new AppError(e.message || "File not uploaded, please try again", 500));

        }

    }

    await user.save();

    res.status(200).json({
        success:true,
        message:'user datils updated successfully'
    });







}


export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword ,
    changePassword,
    updateUser
    
}