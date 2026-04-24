import cookieParser from "cookie-parser";
import express from "express";

const app = express();

app.use(cros({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))

// Major configurations
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("Public"))

app.use(cookieParser())

export {app}