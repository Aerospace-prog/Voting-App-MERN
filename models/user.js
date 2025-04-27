const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true // This field is required
    },
    age:{
        type :Number,
        required : true
    },
    email : {
        type : String,
        
    },
    mobile : {
        type : String,
    },
    address:{
        type : String,
        required : true
    },
    aadharCardNumber:{
        type : String,
        required : true,
        unique : true
    },
    password :{
        type: String,
        required : true
    },
    role:{
        type : String,
        enum : ['voter','admin'],
        default : 'voter'
    },
    isVoted :{
        type : Boolean,
        default : false
    }
})

userSchema.pre('save',async function(next){

    const user = this;//This ensures that it will calls pre middleware function whenver document is saved

    //Hash the password only if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();//here teh user not needs hashing as it is already existed user
    }
    try{
        //hash password generation
        const salt = await bcrypt.genSalt(11);

        //hash password
        const hasedPassword = await bcrypt.hash(user.password,salt);

        //override the plain password with hashed one
        user.password = hasedPassword

        next();
    }catch(error){
        return next(err);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        //use bcrypt to compare the provided password with thr hashed password
        const isMatch = await bcrypt.compare(candidatePassword,this.password);
        return isMatch;

    }catch(error){
        throw error;
    }
}



const User = mongoose.model('User', userSchema);
module.exports = User