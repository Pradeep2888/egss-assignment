const express=require("express")
const cors=require("cors")
const { connection } = require("./config/db")
const { UserModel } = require("./models/UserModel")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const { TaskModel } = require("./models/TaskModel")


const app=express()
const PORT=process.env.PORT||3000

app.use(cors())
app.use(express.json())

app.get("/",(req,res)=>{
 res.send("welcome to api")
})



app.post("/user/register",async(req,res)=>{
    const {name,email,password}=req.body

    const isUser=await UserModel.findOne({email})
    // console.log(isUser)

    if(isUser){
        res.send({"msg":"user already exists"})
    }
    else{
        bcrypt.hash(password,4,async function(err,hash){
            if(err){
                res.send({"msg":"something went wrong"})
            }
            const new_user=new UserModel({
                name,
                email,
                password:hash,

            })

            try{
                await new_user.save()
                res.send({"msg":"sign in succefully"})
            }
            catch(err){
                res.send({"msg":"something went wrong"})
            }



        })
    }

})




app.post("/user/login",async (req,res)=>{
    const {email,password}=req.body
    const user= await UserModel.findOne({email})
    const hashed_password=user.password;
    const user_id=user._id
    // console.log("id",user_id)
    bcrypt.compare(password,hashed_password,function(err,result){
        if(err){
            res.send({"msg":"password incorrect"})
        }
        if(result){
            const token=jwt.sign({user_id},process.env.SECRET_KEY);
           
            res.send({"mesg":"Login sucessfull","token":token})
        }
        else{
            res.send({"msg":"Login faild"})
        }
    })

})

app.post("/user/addtask",async(req,res)=>{
    const {task,token}=req.body
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    const new_task=new TaskModel({
        task,
        status:false,
        userId:decoded.user_id,
        
    })
    
    try{
        await new_task.save()
        res.send({"msg":"task created"})

    }
    catch(err){
        res.send({"msg":"something went wrong"})
    }

})


app.get("/user/gettask/:token",async(req,res)=>{ 
    const {token}=req.params
    const {user_id}=await jwt.verify(token, process.env.SECRET_KEY)
    const task=await TaskModel.find({userId:user_id})
    // console.log(token,user_id)
    res.send({"data":task})
})

app.delete("/user/taskdelete/:taskId",async(req,res)=>{ 
    const {taskId}=req.params
    const task=await TaskModel.remove({_id:taskId})
    // console.log(task)
    res.send({"data":"Item Deleted Successfully"})
})

app.patch("/user/changestatus/:taskId",async(req,res)=>{ 
    const {taskId}=req.params
    const {status}=req.body
    const task=await TaskModel.updateOne({"_id": taskId}, {$set: {"status": status}})
    // console.log(status,taskId)
    res.send({"data":"status Changed"})
})

app.patch("/user/edittask",async(req,res)=>{ 
    const {task,taskId}=req.body
    const newtask=await TaskModel.updateOne({"_id": taskId}, {$set: {"task":task}})
    // console.log(status,taskId)
    res.send({"data":"task updated"})
})








app.listen(PORT,async()=>{
    try{
        await connection
        console.log("connected to mongoDB")
    }
    catch(err){
        console.log(err)
        console.log("Error to connect database")
    }
    console.log(`Listening on PORT ${PORT}`)
})


