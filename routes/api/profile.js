var express = require('express');
const router = express.Router();
var passport =  require('passport');
const {v4 : uuidv4} = require("uuid")

//Load Profile Model
const Profile = require('../../models/profile')
// router.get('/test', (req, res)=>{
//     res.send("corona site")
// });

// @route GET api/profile/:id
// @desc get current profile by id
// @access Private
router.get('/:id', 
    passport.authenticate('jwt', { session: false }),
    async(req, res) => {
        try{
            const errors = {};
            const profile = await Profile.findById(req.params.id)
            if(!profile){
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            return res.status(200).json(profile)
        }catch(err){
            res.status(404).json(err)
        }
    }
);

// @route POST api/profile/create
// @desc creates a profile when a user is registered
// @access Public
router.post('/create', async (req, res)=>{
    try{
        const {id, firstName, lastName } = req.body;

        const newProfile = new Profile( {
            _id: id,
            firstName:firstName, 
            lastName:lastName, 
        });
        newProfile.save()
        return res.json(newProfile)
    }catch(error){
        throw error
    }
})

// @route POST api/profile/send_request
// @desc sending a friend request to another user
// @access Public
router.post('/send_request', async(req, res)=>{
    try{
        const {_id, firstName, lastName, currentID, currentFirstName, currentLastName} = req.body;
        const user = await Profile.findOne({_id})
        for(let i=0; i<user.friendRequestList.length; i++){
            if(user.friendRequestList[i]._id==_id){
                return res.send(`You have already sent a request to ${firstName} ${lastName}`)
            }
        }
        user.friendRequestList = user.friendRequestList.concat({_id:currentID, firstName:currentFirstName, lastName:currentLastName})
        await Profile.updateOne({"_id": _id}, { $set:{"friendRequestList":user.friendRequestList}}, function(err, res) {
            if(err){
                console.log(err)
            }
            console.log(res + " document(s) updated");
        })
        return res.send(`Sent Request to ${firstName} ${lastName}`);
    }catch(error){
        console.log(error)
    }
})

// @route POST api/profile/accept_request
// @desc accepting a friend request from another user
// @access Public
router.post('/accept_request', 
    passport.authenticate('jwt', { session: false }),
    async(req, res)=>{
    try{
        const {currentID, requesterID} = req.body;
        const currentUser = await Profile.findOne({"_id":currentID})
        const requestUser = await Profile.findOne({"_id":requesterID})
        const chatID = uuidv4()
        requestUser.friendsList = requestUser.friendsList.concat(
            {
                id:currentUser._id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                chatObject: {
                    chatID,
                    chatHistory:[]
                }
            }
        )
        currentUser.friendsList = currentUser.friendsList.concat(
            {
                id:requestUser._id,
                firstName: requestUser.firstName,
                lastName: requestUser.lastName,
                chatObject: {
                    chatID,
                    chatHistory:[]
                }
            }
        )

        const newFriendRequestList = requestUser.friendRequestList
        
        for(let i = 0; i<newFriendRequestList.length; i++){
            if(newFriendRequestList[i]._id === requesterID){
                newFriendRequestList.splice(i, 1)
            }
            i=newFriendRequestList.length;
        }
        currentUser.friendRequestList = newFriendRequestList
        await Profile.updateOne({"_id": currentID}, { $set:{"friendRequestList":newFriendRequestList, "friendsList": currentUser.friendsList}})
        await Profile.updateOne({"_id": requesterID}, { $set:{"friendsList": requestUser.friendsList}})
        return res.status(200).json(`You are now friends with ${requestUser.firstName} ${requestUser.lastName}`)
    }catch(error){
        console.log(error)
    }
})

// @route GET /api/profile/open_chat
// @desc opens message box
// @access Private
router.post('/open_chat', 
    passport.authenticate('jwt', { session: false }),
    async(req, res)=>{
    try{
        const {currentID, friendID} = req.body;
        const currentUser = await Profile.findOne({"_id":currentID})
        const chatObject = {
            roomID: null,
            chatHistory: null,
            name: null,
        }
        for(let i=0; i< currentUser.friendsList.length; i++){
            if(currentUser.friendsList[i].id===friendID){
                chatObject.roomID = currentUser.friendsList[i].chatObject.chatID;
                chatObject.chatHistory = currentUser.friendsList[i].chatObject.chatHistory
                chatObject.name = `${currentUser.friendsList[i].firstName} ${currentUser.friendsList[i].lastName}`
            }
        }
        return res.status(200).json(chatObject)

    }catch(error){
        console.log(error)
    }
})

module.exports = router;