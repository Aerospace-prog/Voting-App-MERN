const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {generateToken, jwtAuthMiddleware} = require('../jwt');



//POST route to add a person
router.post('/signup',async (req,res)=>{
    try{
        const data = req.body //Assuming the request body contains person data

        //Create a new Person document using the mongoose model
        const newUser = new User(data);
        
    
        const response = await newUser.save(); // wait for the promise to resolve
        console.log('data saved');

        //genrate token for singup
        const payload = {
            id:response.id
        }
        const token = generateToken(payload);
        console.log("Token is :" ,token);


        res.status(200).json({response: response , token : token});
    }catch(error){
        console.log(error);

        res.status(500).json({error : 'Internal Server Error'});
    }
})


//Login route
router.post('/login',async (req,res)=>{
    try{
        //extract aadharCardNumber and password from request body
        const {aadharCardNumber,password} = req.body;

        //find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber : aadharCardNumber});

        //if user not found return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error : 'Invalid aadharCardNumber or Password'});
        }

        //genrate token for login
        const payload = {
            id:user.id        
        }

        const token = generateToken(payload);

        res.status(200).json({token : token});
    }catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal Server Error'});
    }
})

//profile route
router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userData = req.user;

        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json(user);
    }catch(error){
        console.log(error);
        res.status(500).json({error : 'Internal Server Error'});
    }
})

//Update Operation
router.put('/profile/password',jwtAuthMiddleware , async(req,res)=>{
    try{
        const userId = req.user; //Extract the Id from URL parameter

        const {currentPassword,newPassword} = req.body;

        const user = await User.findById(userId);

        if(!user || !(await user.comparePassword(currentPassword))){
            return res.status(401).json({error : 'Invalid Password'});
        }

        user.password = newPassword;
        await user.save();

        console.log('password Updated');
        res.status(200).json({message :"Password Updated"});

    }catch(error){
        console.log(error);

        res.status(500).json({error : 'Internal Sever Error'});
    }
})


module.exports = router