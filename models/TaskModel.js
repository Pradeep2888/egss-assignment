const mongoose=require("mongoose")

const taskSchema=new mongoose.Schema({
    task:{type:String,required:true},
    status:{type:String,required:true},
    userId:{type:String,required:true},
})

const TaskModel=mongoose.model("task",taskSchema)

module.exports={TaskModel}