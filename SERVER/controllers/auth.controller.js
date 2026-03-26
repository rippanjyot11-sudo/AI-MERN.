import genToken from "../config/token.js"
import User from"../models/user.model.js"
// hm fronetnd se data lenge 
//user create krenge  and usme vo info store krnge jo hme forntend se mili hai and kaise pta chle ki currnet user kons hai 
// to hm token sbanneg use cookkie mai store krnge and usme id bhi store krtnge token to us Id e pta chlega ki kons auser hai
 
// frontend

export const googleAuth =async(req,res)=>{
    try {
        const {name, email}=req.body
     // jo dtata vha se aata ha vo body mai aye to hm body se requets kreneg
        // hm check krenege ki kya user phele se dataase mai to nhi hai agar hai to hm use create nhi karange 
let user=await User.findOne({email})
if(!user){
    user=await User.create({                            //  crdeate user
        name,
        email}
    )
}
  let token =await genToken(user._id)  // databse se koi cheez lere ho ._lagake aacess kro to hm yha user ki id ere h databsae se.                                                        // ab token create kreneg and token ko ko cookie mai store
 res.cookie("token",token,{          // ab token ko cookie mai store aur kb tak cookie mai rhega htpps sb kuc dalna pdhta hai 
httpOnly:true,
secure:false  ,
sameSite: "lax",
maxAge:7*24*60*60*1000      // milliseocnds mai changr              // kyuki abhi  hm locla host pe kam krre h jo ki http pe run krta hai agr true krenge eto vo https pe bhi run krne lg jaygea 
 })
return res.status(200).json(user);
         // isse json mai useer return ho jayega


    } catch (error) {
        return res.status(500).json({message:`Google auth error  ${error}`})
    }
}

export const logOut = async (req, res) => {
    try {
        await res.clearCookie("token");
        return res.status(200).json({ message: "Logout successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Logout error: ${error}` });
    }
}

