import mongoose from "mongoose";
const connectDb=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("database connected")
    }
    catch(error){
        console.log(` databse error ${error}`)
    }
}
    export default connectDb






    //yha mongodb mongoose ki help se  connect hua h