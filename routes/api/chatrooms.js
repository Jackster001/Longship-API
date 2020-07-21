var express = require('express');
var router = express.Router();


router.get('/room', (req,res)=>{
    // io.on('connection', function (socket) {
    //     console.log("hi")
    //     socket.on('joinroom', function (room) {
    //         socket.join(room);
    //         console.log("connected")
    //         console.log('Joined Room: '+ room)
    //         roomNumber=room
    //     });
    // })

})

module.exports = function (io) {
    //Socket.IO
    const nsp = io.of('/chatrooms');
    nsp.on('connection', function (socket) {
        socket.on('joinroom', function (room) {
            socket.join(room.roomID);
            console.log("connected")
            console.log('Joined Room: '+ room.roomID)
            socket.on('SEND_MESSAGE', function(msg){
                nsp.in(room.roomID).emit('RECEIVE_MESSAGE', msg)
            });
        });
    }); 
    return router;
};