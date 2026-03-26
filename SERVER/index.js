import express from "express";
import dotenv from "dotenv";
import connectDb from"./config/connectDb.js"
import cookieParser from"cookie-parser"//to raed cookies
import cors from "cors"
import authRouter from "./routes/auth.route.js"; 
import userRouter from "./routes/user.route.js"; 
import interviewRouter from './routes/interview.route.js';
dotenv.config();


// for security if fronetnd and bakcent are at differnt port brwoaserwill block the requets so cors mai we have give 
//that if requets from this port comes then dont block it take it
dotenv.config()
const app=express()//Creating an Express application instance. app is the object we use to define routes and start the server.// hmne port ki value env file mai save kri ab use access krna hai to to .env krenge aaise and jo port ki value usme hogi vo yha aayegi


    connectDb()
app.get("/",(req,res)=>{
    return res.json({message:"server started"});
})           // ye get requets h hamare ex[prees ke thourgh  konse route  pe request krni h to vo / route h , ye slash ek route h yani agr 
//ispe requets krnege to hme ye message dega // aur jo bhi mesage milra hai vo eke contriller hogya , to aage ka hissa iska hm routes vale folder mai
// aur re, res vala hm controller vale folder mai//This code defines a route that listens for GET requests at /. When accessed, it responds with message ".

app.use(cors({
origin:"http://localhost:5173", // ye btara h is frontend se aayegi requesy accept kr lenma
credentials:true     // true menas allow cookies to travel between frontend and backend   // meri api isi origin pe fetch hongi
}))
app.use(express.json())//  it helps reading json data  from requets//middlewares
app.use(cookieParser())// this helps reading cookies in requets  //midlwares       // app.use se middleware install hota hai
app.use("/api/auth",authRouter)  
app.use("/api/user",userRouter)// these are routes  //"/api/auth" se start hone wali saari requests → authRouter handle karega


app.use("/api/interview",interviewRouter)




const PORT =process.env.PORT||6000
app.listen(PORT, ()=>{                                       
    console.log(`SERVER running on port ${PORT}`) // This starts the server and tells it to listen for requests on port 8000. Once it's running, it logs the message in the terminal.
    //This code starts the server and makes it listen on port 8000. When the server runs, it logs "Server is running on port 3000" to the console.
// congif mai ahi
})