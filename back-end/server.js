const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server,{
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

let rooms = {'general': []};

app.use(cors());
app.use(express.static('public'));

app.get('/rooms', (req, res) => {
    res.json(Object.keys(rooms));
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

io.on('connection', (socket) => {
    let currentRoom = null;
    let username = null;
    console.log('New user connected');

    socket.on('joinRoom', (room, user) => {
        username = user;
        currentRoom = room;

        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push(username);

        socket.join(room);
        io.to(room).emit('userList', rooms[room]);
        io.to(room).emit('message', `${username} has joined the room`);
        console.log(`${username} has joined the ${room}`);
    });

    socket.on('sendMessage', (message) => {
        if (currentRoom) {
            io.to(currentRoom).emit('message', `${username}: ${message}`);
        }
    });

    socket.on('disconnect', () => {
        if (currentRoom) {
            rooms[currentRoom] = rooms[currentRoom].filter(user => user !== username);
            io.to(currentRoom).emit('userList', rooms[currentRoom]);
            io.to(currentRoom).emit('message', `${username} has left the room`);
            console.log(`${username} has left the ${currentRoom}`);
        }
    });
});

server.listen(5001, () => {
    console.log('Server is running on port 5001');
});
