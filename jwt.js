const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next)=>{

    //first check the request header has authorization or not
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.status(401).json({error : 'Token Not found'});
    }

    //Extract the jwt token from the request headers
    const token = req.headers.authorization.split(' ')[1];

    if(!token){
        return res.status(401).json({error : 'Unauthorized'});
    }

    try{
        //verify the token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        //Attach the user data to the request object
        req.user = decoded;
        next();
    }catch(err){
        console.log(err);

        return res.status(401).json({error : 'Unauthorized'});
    }

}

//Function to generate JWT token
const generateToken = (userData)=>{
    //Generate a new JWT token using user data
    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:'1h'});
}
module.exports = {
    generateToken, jwtAuthMiddleware
}