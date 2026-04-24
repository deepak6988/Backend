import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))

// Major configurations
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("Public"))

app.use(cookieParser())


//import routes

import { router } from "./Routes/user.router.js";


// Routes declaration

app.use("/api/v1/user", router)

export {app}