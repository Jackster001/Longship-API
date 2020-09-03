var express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
var passport =  require('passport');
// const validateRegisterInput= require('../../validation/register');
// const validateLoginInput= require('../../validation/login');

//Load User Model
const User = require('../../models/User')

// @route POST api/users/register
// @desc Register a User
// @access Public
router.post('/register', async (req, res)=>{
    try{
        const {firstName, lastName, email, password} = req.body;
        const prevUser = await User.findOne({email:email})
        if(prevUser){
            return res.status(400).json("Account already registered with this email");
        }
        newUser = new User( {firstName:firstName, lastName:lastName, email:email, password:password});
        const salt= await new Promise ((resolve, reject)=>{
            bcrypt.genSalt(10, (err, salt)=>{
            if(err) return resolve(err)
            resolve(salt)
        })})
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(""+newUser.password, salt, function(err, hash) {
              if (err) throw (err) 
              resolve(hash)
            });
        })
        newUser.password = hashedPassword.toString();
        newUser.save()
        return res.json(newUser)
    }catch(error){
        throw error
    }
})

// @route POST api/users/login
// @desc Logs in a User
// @access Public
router.post('/login', async(req, res)=>{
    try{
        const {email, password} = req.body;
        const prevUser = await User.findOne({email})
        if(!prevUser){
            return res.status(404).json("Account not found");
        }
        const rel = await bcrypt.compare(password, prevUser.password)

        if(!rel){
            return res.status(400).json({password: 'Email or Password is Incorrect'})
        }

        //User Matched
        const payload = {id: prevUser.id, firstName: prevUser.firstName, lastName: prevUser.lastName, chatRooms: prevUser.chatrooms }

        //Sign Token 
        let token = await jwt.sign(payload, keys.secretOrKey, { expiresIn: 7200 });
        token = 'Bearer '+ token;
        return res.status(200).json({token});
    }catch(error){
        throw error
    }
})

// @route GET api/users/current
// @desc Returns Current User
// @access Public
router.get('/current', passport.authenticate('jwt', {session:false}), async(req, res)=> {
    try{
        res.json({msg: 'success'})
    }catch(err) {throw err}
})

// @route post api/users/current/findUsers
// @desc returns user by id
// @access Public
router.post('/findusers', async(req, res)=>{
    try{
        const {name, id} = req.body;
        let nameArr = name.split(" ")
        let result=[];
        if(nameArr[0] && nameArr[0].length>0 && nameArr[1] && nameArr[1].length>0){
            result= await User.find({firstName:nameArr[0], lastName:nameArr[1]})    
        }else if(nameArr[0].length>0){
            result = await User.find({firstName:nameArr[0]})  
            result = result.concat(await User.find({lastName:nameArr[0]}) )
            if(nameArr[1]){
                result= result.concat(await User.find({firstName:nameArr[1]}))
                result= result.concat(await User.find({lastName:nameArr[1]}))
            }
        }else{
            result= await User.find({firstName:nameArr[1]})
        }
        for(let i=0; i<result.length; i++){
            if(id === result[i]._id.toString()){
                result.splice(i,1)
                i=result.length
            }
        }
        result = result.map((user,i)=>{
            return user={
                _id:user._id,
                firstName:user.firstName,
                lastName:user.lastName
            }
        })
        return res.send(result)

    }catch(err){
        throw err
    }

});

module.exports = router;
