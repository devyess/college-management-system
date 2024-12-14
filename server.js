const express=require("express");
const app=express();
const cors=require("cors");
const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DB_URL,{
      useNewUrlParser:true,
      useUnifiedTopology:true,
}).then(()=>{
      console.log("MongoDB connected successfully");
}).catch((err)=>{
      console.log("MongoDB connection error",err);
})

const studentRoutes=require("./routes/studentRoutes");
const professorRoutes=require("./routes/professorRoutes");

app.use('/students',studentRoutes);
app.use('/professors',professorRoutes);

app.listen(process.env.PORT,()=>{
      console.log(`Server is running on port ${process.env.PORT}`);
})

