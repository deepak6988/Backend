import mongoose from "mongoose";
// import { DB_NAME } from "./Constants";
// import express from "express";
import dotenv from "dotenv";
import ConnectDB from "./DB/index.js";

dotenv.config({
    path: "./env"
})


// Connection Option 2.

ConnectDB();


/*

### Connection Option 1.


const app = express();

( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        
        app.on("error", (error) => {
            console.log("error", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("error", error);
        throw error;
    }

})()
    */