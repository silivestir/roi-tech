// socketHandler.js
const { Server } = require("socket.io");
const express = require('express');
const path = require('path');
const ioAuthMiddleware = require("./auth");
const token = require("../routes/loginRoute")
const fs = require('fs');
const http = require('http');
const multer = require("multer");
;
const { exec } = require('child_process'); 
// creting  in memory  storage  spaces  for users and  files  be uploaded 
let users = {};
let files = {};


const socketIo = require('socket.io');
const upload = multer({ dest: 'uploads/' });
const AUDIO_DIR = "./audio"
const chatHistory = [];

//a  general  purpose  method for setting  up  socket,establishing and  re etablishig connection 
const setupClassSocket = (server) => {

    const io = new Server(server);


    const app = express()
    if (!fs.existsSync(AUDIO_DIR)) {
        fs.mkdirSync(AUDIO_DIR);
    }
    app.use(express.static("audio"))

    io.on('connection', (socket) => {
        console.log(`User connected`)
        socket.on('join', (payload) => {
            const roomId = payload.room
            const roomClients = io.sockets.adapter.rooms[roomId] || { length: 0 }
            const numberOfClients = roomClients.length
            console.log(`Room ID: ${roomId}`)
            console.log(`roomClients: ${roomClients}`)
            console.log(`numberOfClients of ${roomId}: ${numberOfClients}`)


            // These events are emitted only to the sender socket
            if (numberOfClients == 0) {
                console.log(`Creating room ${roomId} and emitting room_created socket event`)
                socket.join(roomId)
                socket.emit('room_created', {
                    roomId: roomId,
                    peerId: socket.id
                })
            } else {
                console.log(`Joining room ${roomId} and emitting room_joined socket event`)
                socket.join(roomId)
                socket.emit('room_joined', {
                    roomId: roomId,
                    peerId: socket.id
                })
            }
        })

        // These events are emitted to all the sockets connected to the same room except the sender.
        socket.on('start_call', (event) => {
            console.log(`Broadcasting start_call event to peers in room ${event.roomId} from peer ${event.senderId}`)
            socket.broadcast.to(event.roomId).emit('start_call', {
                senderId: event.senderId
            })
        })

        //Events emitted to only one peer
        socket.on('webrtc_offer', (event) => {
            console.log(`Sending webrtc_offer event to peers in room ${event.roomId} from peer ${event.senderId} to peer ${event.receiverId}`)
            socket.broadcast.to(event.receiverId).emit('webrtc_offer', {
                sdp: event.sdp,
                senderId: event.senderId
            })
        })

        socket.on('webrtc_answer', (event) => {
            console.log(`Sending webrtc_answer event to peers in room ${event.roomId} from peer ${event.senderId} to peer ${event.receiverId}`)
            socket.broadcast.to(event.receiverId).emit('webrtc_answer', {
                sdp: event.sdp,
                senderId: event.senderId
            })
        })

        socket.on('webrtc_ice_candidate', (event) => {
            console.log(`Sending webrtc_ice_candidate event to peers in room ${event.roomId} from peer ${event.senderId} to peer ${event.receiverId}`)
            socket.broadcast.to(event.receiverId).emit('webrtc_ice_candidate', event)
        })


        let currentCode = 'console.log("Hello, world!");';



        // Send the current code when a new user connects
        socket.emit('document-update', { code: currentCode });

        // Handle real-time collaborative code editing
        socket.on('document-update', (msg) => {
            if (msg.code !== currentCode) {
                currentCode = msg.code; // Update the shared code
                socket.broadcast.emit('document-update', msg); // Broadcast to all users except sender
            }
        });

        // Handle running code on the server using child_process
        socket.on('run-code', (code) => {
            // Save the code to a temporary JavaScript file
            const tempFileName = './tempCode.js';
            const fs = require('fs');
            fs.writeFileSync(tempFileName, code);

            // Execute the JavaScript file in a separate process
            exec(`node ${tempFileName}`, (error, stdout, stderr) => {
                if (error) {
                    socket.emit('code-output', `Error: ${stderr}`);
                } else {
                    socket.emit('code-output', stdout); // Send the output of the code back to the client
                }

                // Clean up: remove the temporary file
                fs.unlinkSync(tempFileName);
            });
        });

        // Handle disconnections
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });










        socket.on('join class', ({ className, userName }) => {
            socket.join(className);
            console.log(`${userName} joined class ${className}`);
            io.to(className).emit('class joined', { className, userName });
        });

        socket.on('document-update', (msg) => {
            socket.to(msg.className).emit('document-update', msg); // Broadcast to others in the same room
        });

        socket.on('cursor-update', (data) => {
            socket.to(data.className).emit('cursor-update', data); // Relay cursor position to others in the group
        });
        //  creen sharing  signaling starts  from here 

        //establishing  socket for screensharing  events from  the  client(s)

        socket.on('screen', (data) => {
            // Broadcast the screen stream to all other clients if any.
            socket.broadcast.emit('screen', { id: socket.id, tracks: data.tracks });
            console.log("i ve shared  data  emitting onscreen event", data.tracks)
        });


        //signaling  starts from here , user  are created ,  establish  connetion , or reconnect
        socket.on('offer', (data) => {
            // Send the offer to the receiver 
            socket.to(data.to).emit('offer', { sdp: data.sdp, from: socket.id });
            consoe.log("emited  on offer  event  sharing  offer", data.sdp)
        });

        socket.on('answer', (data) => {
            // Send the answer to the originating peer , (handling  client  offer)
            socket.to(data.to).emit('answer', { sdp: data.sdp, from: socket.id });

            console.log("i  worked  too  i just  share  answe ", data.sdp)
        });


        //sharing ice  candidates to the connected user
        socket.on('ice-candidate', (data) => {
            // Send the candidate to the designated peer
            socket.to(data.to).emit('ice-candidate', { candidate: data.candidate, from: socket.id });

            console.log("this is  just  an ice  event  be fired ", data.candidate)
        });







        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });




        socket.on('audio-data', (data) => {
            const audioFilePath = path.join(`./audio/audio-${Date.now()}.webm`);
            fs.writeFile(audioFilePath, data, 'base64', (err) => {
                if (err) {
                    console.error('Error saving audio file:', err);
                } else {
                    console.log('Audio file saved:', audioFilePath);
                    // You may want to notify clients here
                }
            });
        });

        // Optionally handle requests to play audio by sending the list of filenames
        socket.on('request-audio-list', () => {
            fs.readdir(AUDIO_DIR, (err, files) => {
                if (err) {
                    console.error('Error reading audio directory:', err);
                    return;
                }

                const audioFiles = files.map(file => `${file}`

                ); // Prepare paths for the client
                socket.emit('audio-list', audioFiles);
            });
        });

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


        app.post('/upload', upload.single('file'), (req, res) => {
            const filePath = `/uploads/${req.file.filename}`;
            const groupName = req.body.groupName;

            // Save file info in memory (you could save it to a database here)
            if (!files[groupName]) {
                files[groupName] = [];
            }

            files[groupName].push(filePath);

            res.json({ filePath });
        });





    })
    app.post('/upload', upload.single('file'), (req, res) => {
        const filePath = `/uploads/${req.file.filename}`;
        const groupName = req.body.groupName;

        // Save file info in memory (you could save it to a database here)
        if (!files[groupName]) {
            files[groupName] = [];
        }

        files[groupName].push(filePath);

        res.json({ filePath });
    });

    app.get('/audio/:filename', (req, res) => {
        const filePath = `${req.params.filename}`;
        res.sendFile(filePath);
    });




    return io;
};







module.exports = setupClassSocket;