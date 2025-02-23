// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from 'public' folder

// Listen for incoming connections from clients
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle real-time code editing (receive document update from one user and broadcast it to others)
    socket.on('document-update', (msg) => {
        // Broadcast document update to all other users
        socket.broadcast.emit('document-update', msg);
    });

    // Handle code execution request from the client
    socket.on('run-code', (code) => {
        let output;
        try {
            // Execute the code (using a basic JavaScript eval)
            output = eval(code);
        } catch (err) {
            output = `Error: ${err.message}`;
        }
        // Send back the output of the code execution
        socket.emit('code-output', output);
    });

    // Start voice chat - offer/answer exchange for WebRTC
    socket.on('start', (data) => {
        console.log(data.message);
        // Broadcast that a user started a chat (to initiate signaling)
        socket.broadcast.emit('start', data);
    });

    // Stop voice chat
    socket.on('stop', (data) => {
        console.log(data.message);
        // Broadcast that a user stopped the chat
        socket.broadcast.emit('stop', data);
    });

    // Handle offer from the client and broadcast it to other users
    socket.on('offer', (data) => {
        console.log('Offer received', data);
        socket.broadcast.emit('offer', data);
    });

    // Handle answer from the client and broadcast it to other users
    socket.on('answer', (data) => {
        console.log('Answer received', data);
        socket.broadcast.emit('answer', data);
    });

    // Handle ICE candidates from the client and broadcast it to other users
    socket.on('ice-candidate', (candidate) => {
        console.log('ICE Candidate received', candidate);
        socket.broadcast.emit('ice-candidate', candidate);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server on a specific port
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});