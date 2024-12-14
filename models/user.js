const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
      name:{
            type:String,
            required:true,
      },
      email:{
            type:String,
            unique:true,
            required:true,            
      },
      password:String,
      role:{
            type:String,
            required:true,
            enum: ["student", "professor"], 
      }
})

module.exports=mongoose.model("User",userSchema);