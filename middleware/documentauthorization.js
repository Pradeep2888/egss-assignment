const jwt=require("jsonwebtoken")
const { UserModel } = require("../models/UserModel")
require("dotenv").config()

const documentauthorization=async (req,res,next)=>{
    const token=req.headers.authorization?.split(" ")[1]

    if(!token){
        res.send({"msg":"please login"})
    }

    const decoded=jwt.verify(token,process.env.SECRET_KEY);
    const userId=decoded.user_id
    const user= await UserModel.findOne({userId})

    if(user.isAdmin===false){
        next()
    }
    else{
        res.send({"msg":"you are not authorised user"})
    }
    


}

module.exports={documentauthorization}