const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsynErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const ErrorHandler = require("../utils/errorhandler");
const sendEmail = require("../utils/sendEmail")


// Register a User

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  
  const { name, email, password } = req.body;

  const user = await User.create({
    name,email,password,
    avatar: {
      public_id: "this is sample id",
      url: "profilepicUrl"
    }
  });


  sendToken(user, 200, res);


   
});


// Login User

exports.loginUser = catchAsyncErrors( async(req,res,next) => {

    const {email,password} =req.body;

    // check username and password

    if(!email || !password) {
        return next(new ErrorHander("Please enter email and password",400));

    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHander("Invalid Email or Password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHander("Invalid Email or Password"));
    }
    sendToken(user, 200, res);
});

// Logout User

exports.logout = catchAsyncErrors(async(req,res,next)=>{

  res.cookie("token", null,{
    expires:new Date(Date.now()),
    httpOnly: true, 
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
})

//Forget Password

exports.forgetPassword = catchAsyncErrors( async(req,res,net) => {
  const user= await User.findOne({email:req.body.email});

  if(!user) {
    return next(new ErrorHandler("User not found",404));
  }

  //Get Forget password token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\n If you have
  not requested this email please ignore`;

  try {

    await sendEmail ({
      email: user.email,
      subject:'Ecommerce Password Recovery',
      message,

    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`
    })
    

  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({validateBeforeSave:false});

    return next (new ErrorHandler(error.message,500));
  }
});

exports.forgetPassword = catchAsyncErrors(async(req,res,4))