// setupPdfFunction.js


const setupPdfFunction = (server) => {
    const express = require('express');
    const socketIo = require('socket.io');
    const multer = require('multer');
    const path = require('path');
    const uuid = require('uuid');
    const app = express()


    const upload = multer({ dest: 'uploads/' });


    let users = {};
    let files = {};

    const io = socketIo(server);


    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        let groupName = null;

        // Join a group when user joins
        socket.on('join-group', (group) => {
            groupName = group;
            if (!users[groupName]) {
                users[groupName] = [];
            }
            users[groupName].push(socket.id);
            socket.join(groupName);
            console.log(`${socket.id} joined group: ${groupName}`);
        });

        // Handle file clicked event (open the file)
        socket.on('file-clicked', (data) => {
            console.log(`File clicked: ${data.filePath}`);
            io.to(groupName).emit('alert-file', data.filePath);
        });

        // Handle drawing events
        socket.on('drawing', (data) => {
            socket.to(groupName).emit('drawing', data);
        });

        // Handle WebRTC signaling events (voice chat)
        socket.on('webrtc-offer', (data) => {
            socket.to(data.peerId).emit('webrtc-offer', data);
        });

        socket.on('webrtc-answer', (data) => {
            socket.to(data.peerId).emit('webrtc-answer', data);
        });

        socket.on('new-peer', (peerId) => {
            socket.to(peerId).emit('new-peer', socket.id);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            if (groupName) {
                const index = users[groupName].indexOf(socket.id);
                if (index !== -1) {
                    users[groupName].splice(index, 1);
                }
                console.log(`${socket.id} disconnected from group: ${groupName}`);
            }
        });
    });

    // Set up the upload route
    const uploadRoute = express.Router();

    app.post('/upload', upload.single('file'), (req, res) => {
        const filePath = `/uploads/${req.file.filename}`;
        const groupName = req.body.groupName;

        // Save file info in memory (you could save it to a database here)
        if (!files[groupName]) {
            files[groupName] = [];
        }

        files[groupName].push(filePath);

        // Emit file upload event to group members
        io.to(groupName).emit('new-file', { filePath });

        res.json({ filePath });
    });

    // Return the upload route so it can be used in the main app
    return uploadRoute;
};
// Setup additional WebSocket handlers

module.exports = setupPdfFunction;















































const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"))

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('screen', (data) => {
        // Broadcast the screen stream to all other clients
        socket.broadcast.emit('screen', { id: socket.id, tracks: data.tracks });
    });

    socket.on('offer', (data) => {
        // Send the offer to the receiver
        socket.to(data.to).emit('offer', { sdp: data.sdp, from: socket.id });
    });

    socket.on('answer', (data) => {
        // Send the answer to the originating peer
        socket.to(data.to).emit('answer', { sdp: data.sdp, from: socket.id });
    });

    socket.on('ice-candidate', (data) => {
        // Send the candidate to the designated peer
        socket.to(data.to).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});