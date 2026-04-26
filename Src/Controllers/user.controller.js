import { asyncHandler } from "../Utils/asyncHandler.js"
import {ApiError} from "../Utils/ApiError.js"
import {User} from "../Models/User.models.js"
import {uploadOnCloudinary} from "../Utils/cloudinary.js"
import {ApiResponse} from "../Utils/ApiResponse.js"
import fs from "fs"

const generateAccessAndRefreshToken = async (userId) => {
  try{
      const user = await User.findById(userId);
      const accessToken = user.generateaccesstoken();
      const refreshToken = user.generaterefreshtoken();

      user.refreshToken = refreshToken;
      await user.save({validateBeforeSave : false});

      return {accessToken,refreshToken};
  }
  catch(error){
    throw new ApiError(500,"Error while generating tokens")
  }
}

const registerUser = asyncHandler( async (req,res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exist
    // check for img, avatar
    // upload on cloudinary
    // create user object
    // remove password and refresh token from response
    // check user creation
    // return res

    const {fullName,email,username,password} = req.body
    // console.log("req.body : ", req.body);

    if(
        [fullName,email,username,password].some((fields) => fields?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    };
    
    // console.log("email : ", email);

   const existingUser = await User.findOne({
    $or : [{username},{email}]
   })    

   

   const avatarlocal = req.files?.avatar[0]?.path;
  //  const coverlocal = req.files?.coverImage[0]?.path;

   let coverlocal;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverlocal = req.files.coverImage[0].path
    }

    if(existingUser){
    fs.unlinkSync(avatarlocal);
    fs.unlinkSync(coverlocal);
    throw new ApiError(409,"User already exist");
   }

   if(!avatarlocal){
    throw new ApiError(400,"Avatar file is required");
   }

  const avatar = await uploadOnCloudinary(avatarlocal);
  const coverImage = await uploadOnCloudinary(coverlocal);


  if(!avatar){
    throw new ApiError(400,"Avatar file is required");
  }


  const user = await User.create({
    fullName,
    email,
    password,
    username : username.toLowerCase(),
    avatar : avatar.url,
    coverImage : coverImage?.url || ""
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500,"Error while saving user to DB")
  }

  return res.status(201).json(
    new ApiResponse(201,createdUser,"User registered")
  )

} )


const loginUser = asyncHandler( async (req,res) => {
  // get email and password from frontend
  // validation - not empty
  // check if user exist with email
  // check password is correct
  // generate access token and refresh token
  // send response in cookie
  console.log("Login user controller called");

  const {username,email,password} = req.body 

  if(!email && !username){
    throw new ApiError(400,"Email and username are required");
  }

  const user = await User.findOne({
    $and : [ {email} , {username}]
  })

  if(!user){
    throw new ApiError(404,"User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if(!isPasswordCorrect){
    throw new ApiError(401,"Invalid credentials");
  }

  const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly : true,
    secure : true
  }

  return res
         .status(200)
         .cookie("refreshToken",refreshToken,options)
         .cookie("accessToken",accessToken,options)
         .json(
          new ApiResponse(200,{
            user : loggedInUser,accessToken,refreshToken
           },
           "User logged in successfully")
         )


})

const logoutUser = asyncHandler( async (req,res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset : {
        refreshToken : 1
      }
    },
    {
      new : true
    }
  )

  const options = {
    httpOnly : true,
    secure : true
  }

  return res
           .status(200)
           .clearCookie("refreshToken",options)
            .clearCookie("accessToken",options)
            .json(
              new ApiResponse(200,{},"User logged out successfully")
            )

})

export {
   registerUser,
   loginUser,
   logoutUser
  }

