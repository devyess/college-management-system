//Signup and login for the student
//View the availability of the professor
//Book an appointment with the professor

const express=require("express");
const router=express.Router();
const mongoose=require("mongoose");
const User=require("../models/user");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const {z}=require("zod");
const authenticateToken=require("../middlewares/authenticateToken");
const Availability=require("../models/availability");
const Appointment=require("../models/appointments");

//Endpoint for student signup
router.post('/signup',async function(req,res){
      try{
            const {name,email,password}=req.body;
            const user=await User.findOne({email,role:"student"});
            if(user){
            return res.status(400).json({message:"User already exists"});
            }
            // Hash the password
            const salt=await bcrypt.genSalt(10);
            const hashedPassword=await bcrypt.hash(password,salt);
            const newUser=new User({name,email,password:hashedPassword,role: "student",});
            await newUser.save();

            res.status(201).json({
                  message:"Student Registered Successfully"
            });
      }
      catch(err){
            res.status(500).json({
                  message:"Internal Server Error"
            });
      }
})

//Endpoint for student login
router.post('/login',async function(req,res){
      try{
            const {email,password}=req.body;
            // Find the user by email and role
            const user=await User.findOne({email,role:"student"});
            if(!user){
                  return res.status(400).json({
                        message:"Invalid Credentials"
                  })
            }

            // Check if the password matches
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

//This endpoint will ensure that the student can view the availability of the professor
router.get('/availability',authenticateToken,async function(req,res){
      try{
            const availability=await Availability.find();
            res.status(200).json(availability);
      }catch(err){
            res.status(500).json({
                  message:"Internal Server Error"
            })
      }
})

//I will use Zod for input validation for the appointment booking
const appointmentSchema=z.object({
      professorId:z.string().min(1,"Professor ID is required"),
      date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/,"Date must be in YYYY-MM-DD format"),
      startTime:z.string().regex(/^\d{2}:\d{2}$/,"Start time must be in HH:mm format"),
      endTime:z.string().regex(/^\d{2}:\d{2}$/,"End time must be in HH:mm format"),
})

router.get('/appointments', authenticateToken, async function(req, res) {
      try {
          const appointments = await Appointment.find({
              studentId: req.user.userId
          });
          res.status(200).json(appointments);
      } catch(err) {
          res.status(500).json({
              message: "Internal Server Error"
          });
      }
  });

//This endpoint allows students to book an appointment with a professor
router.post('/appointments',authenticateToken,async function(req,res){
      try{
            const validation=appointmentSchema.safeParse(req.body);
            if(!validation.success){
                  return res.status(400).json({
                        message:"Validation error",
                        errors:validation.error.errors.map((err)=>({
                              path:err.path,
                              message:err.message
                        }))
                  })
            }
            const {professorId,date,startTime,endTime}=validation.data;
            const appointment=new Appointment({
                  professorId,
                  studentId:req.user.userId,
                  date,
                  startTime,
                  endTime
            });
            await appointment.save();
            res.status(201).json({
                  message:"Appointment booked successfully",
                  appointment
            })
      }catch(err){
            console.log(err);
            res.status(500).json({
                  message:"Internal Server Error"
            })
      }
})

module.exports=router;