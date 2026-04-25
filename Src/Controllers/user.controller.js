import { asyncHandler } from "../Utils/asyncHandler.js"
import {ApiError} from "../Utils/ApiError.js"
import {User} from "../Models/User.models.js"
import {uploadOnCloudinary} from "../Utils/cloudinary.js"
import {ApiResponse} from "../Utils/ApiResponse.js"
import fs from "fs"


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


export {registerUser}

