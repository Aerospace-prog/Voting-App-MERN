const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware} = require('../jwt');
const Candidate = require('../models/candidate');
const User = require('../models/user');




const checkAdminRole = async(userId)=>{
    try{
        const user = await User.findById(userId);
        if(user.role === 'admin'){
            return true;
        }
    }catch(error){
        return false;
    }
}



//POST route to add a person
router.post('/',jwtAuthMiddleware,async (req,res)=>{
    try{

        if(!await checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'User has not admin role'});
        }


        const data = req.body 
        const newCandidate = new Candidate(data);
        
    
        const response = await newCandidate.save(); 
        
        console.log('data saved');

        res.status(200).json({response: response});

    }catch(error){
        console.log(error);

        res.status(500).json({error : 'Internal Server Error'});
    }
})



//Update Operation
router.put('/:candidateId',jwtAuthMiddleware , async(req,res)=>{
    try{

     if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'User has not admin role'});
        }

        const candidateId = req.params.candidateId; 

        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new:true,
            runValidators:true,
        })

        if(!response){
            return res.status(400).json({error : 'Invaled Person Id'});
        }

        console.log('Candidate Data Updated');
        res.status(200).json(response);

    }catch(error){
        console.log(error);

        res.status(500).json({error : 'Internal Sever Error'});
    }
})


//delete route
router.delete('/:candidateId' ,jwtAuthMiddleware, async(req,res)=>{
    try{

     if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'User has not admin role'});
        }

        const candidateId = req.params.candidateId; 

        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndDelete(candidateId);

        if(!response){
            return res.status(400).json({error : 'Invaled Candidate Id'});
        }

        console.log('Candidate Data Deleted');
        res.status(200).json(response);

    }catch(error){
        console.log(error);

        res.status(500).json({error : 'Internal Sever Error'});
    }
})


router.post('/vote/:candidateId',jwtAuthMiddleware,async (req,res)=>{
    //no admin can vote
    //user can only vote once

    const candidateId = req.params.candidateId;
    const userID = req.user.id;

    try{
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({error: 'Candidate not found'});
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }

        if (user.isVoted) {
            return res.status(400).json({error: 'User has already voted'});
        }

        if(user.role === 'admin'){
            return res.status(403).json({error: 'Admins not allowed'});
        }

        //update the canditate document to record the vote
        candidate.votes.push({ user: userID });
        candidate.voteCount++;
        await candidate.save();

        //update the user doucment
        user.isVoted = true;
        await user.save();

        res.status(200).json({message: 'Vote recorded successfully'});
    }catch(err){
        return res.status(500).json({error : 'Internal Server Error'});
    }

})


router.get('/vote/count',async (req,res)=>{
    try{
        //find all candidates and sort them by votecount in descending order
        const candidates = await Candidate.find().sort({voteCount:'desc'});

        //Map the candidate to only return their name and votecount
        const voteRecord = candidates.map((data)=>{
            return {
                party:data.party,
                count : data.voteCount
            }
        })

        return res.status(200).json(voteRecord);
        
    }catch(err){
        return res.status(500).json({error : 'Internal Server Error'});
    }
})

router.get('/list',async (req,res)=>{
    try{
        const candidates = await Candidate.find();

        if(!candidates){
            return res.status(404).json({error : 'No candidates found'});
        }

        res.status(200).json(candidates);
    }catch(err){
        return res.status(500).json({error : 'Internal Server Error'});
    }
})
module.exports = router