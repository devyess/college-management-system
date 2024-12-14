//Signup and login for the professor
//Post the availability of the professor
//Delete the availability of the professor

const express=require("express");
const router=express.Router();
const mongoose=require("mongoose");
const User=require("../models/user");
const bcrypt=require("bcrypt");
const authenticateToken=require("../middlewares/authenticateToken");
const { z } = require('zod');
const jwt=require("jsonwebtoken");
const Availability=require("../models/availability");
const Appointment=require("../models/appointments");
//Allowing a professor to signup
router.post('/signup',async function(req,res){
      try{
            const {name,email,password}=req.body;
            const user=await User.findOne({email,role:"professor"});
            if(user){
            return res.status(400).json({message:"User already exists"});
            }
            const salt=await bcrypt.genSalt(10);
            const hashedPassword=await bcrypt.hash(password,salt);
            const newUser=new User({name,email,password:hashedPassword,role: "professor",});
            await newUser.save();

            res.status(201).json({
                  message:"Professor Registered Successfully"
            });
      }
      catch(err){
            res.status(500).json({
                  message:"Internal Server Error"
            });
      }
})

//For accessing the functionality of the professor, they must login, this will be done using JWT
router.post('/login',async function(req,res){
      try{
            const {email,password}=req.body;
            const user=await User.findOne({email,role:"professor"});
            if(!user){
                  return res.status(400).json({
                        message:"Invalid Credentials"
                  })
            }

            //Check if the password matches with the hashed password
            const isPasswordCorrect=await bcrypt.compare(password,user.password);
            if(!isPasswordCorrect){
                  return res.status(400).json({
                        message:"Password is incorrect"
                  })
            }
            const token=jwt.sign({
                  userId:user._id,
                  email:user.email,
                  role:user.role
            },process.env.JWT_SECRET,{
                  expiresIn:"1h"
            });
            res.status(200).json({
                  message:"Login Successfully",
                  token

            })
      }
      catch(err){
            res.status(500).json({
                  message:"Internal Server Error"
            })
      }
})

//I have used Zod for input validation. This validation is for the availability of the professor
const availabilitySchema = z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:mm format"),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:mm format"),
});

//Allowing the professor to specify their avaliability(Date, strat time and end time will be the input)
router.post('/availability',authenticateToken,async function(req,res){

      //Validate the input for appropriate formatting
      const validation = availabilitySchema.safeParse(req.body);
      if (!validation.success) {
            return res.status(400).json({
                  message: "Validation error",
                  errors: validation.error.errors.map((err) => ({
                  path: err.path,
                  message: err.message,
                  })),
            });
      }

      //Allowing the professor to add their availability
      try{
            const{date,startTime,endTime}=validation.data;
            if(req.user.role!="professor"){
                  return res.status(403).json({
                        message:"Access Denied"
                  })
            }
            const availability=new Availability({
                  professorId:req.user.userId,
                  date,
                  startTime,
                  endTime
            })
            await availability.save();
            res.status(201).json({
                  message:"Availability Added Successfully",
                  availability,
            })
      }catch (err) {
            console.error("Error occurred:", err);
            res.status(500).json({ message: "Internal Server Error" });
      }
})

//To allow the professor to cancel an appointment
router.delete('/availability/:appointmentId', authenticateToken, async function(req, res) {
      try {
          // Find the appointment by ID
          const idr=new mongoose.Types.ObjectId(req.params.appointmentId);
          const appointment = await Appointment.findOne({
              _id: idr,
              professorId: req.user.userId
          });
          console.log(appointment);
          if (!appointment) {
              return res.status(404).json({
                  message: "Appointment Not Found or Unauthorized"
              });
          }
  
          // Check if the appointment is in the future
          const appointmentDate = new Date(`${appointment.date}T${appointment.startTime}`);
          if (appointmentDate < new Date()) {
              return res.status(400).json({
                  message: "Cannot cancel past appointments"
              });
          }
  
          // Delete the appointment
          await Appointment.findByIdAndDelete(appointment._id);
  
          res.status(200).json({
              message: "Appointment Cancelled Successfully"
          });
      } catch(err) {
          console.log(err);
          res.status(500).json({
              message: "Internal Server Error"
          });
      }
  });

module.exports=router;