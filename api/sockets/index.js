const EventEmitter = require('events');
let io;
module.exports = (server) => {
    if(typeof io != 'undefined') {
        console.log('returning io');
        return io;
    }
    console.log('creating object of io');
    io = require('socket.io').listen(server);

    io.on('connection', (socket) => {
        console.log('User connected');

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    return io;
};
