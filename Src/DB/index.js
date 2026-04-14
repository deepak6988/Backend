import mongoose from "mongoose";
import { DB_NAME } from "../Constants.js";

const ConnectDB = async () => {
    try {

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log(`Database connected !! DB Host : ${connectionInstance.connection.host}`)
        
    } catch (error) {
        console.log("Error connecting to database ", error);
        process.exit(1);
    }
}

export default ConnectDB;