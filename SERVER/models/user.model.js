import mongoose from "mongoose";
  const userSchema=new mongoose.Schema({
    name:{
        type:String,
    required:true},
email:{
    type:String,
    unique:true,
    required:true},
    credits:{
        type:Number,
        default:100
    }
}  ,{timestamp:true})

const User=mongoose.model("User", userSchema)
export default User // ab is modle ko kisi bhi file mai use kr skte ho.. ab autyhentictaion ke liye firebase setup



