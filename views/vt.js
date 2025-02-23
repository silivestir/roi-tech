// Replace with your signaling server URL
const socket = io();

// Global variables
let localStream;
let peerConnection;
let remoteStream;
let isCallActive = false;

// WebRTC configuration
const iceServers = [{
    urls: [
        "stun:jb-turn1.xirsys.com",
        "turn:jb-turn1.xirsys.com:80?transport=udp",
        "turn:jb-turn1.xirsys.com:3478?transport=udp",
        "turn:jb-turn1.xirsys.com:80?transport=tcp",
        "turn:jb-turn1.xirsys.com:3478?transport=tcp",
        "turns:jb-turn1.xirsys.com:443?transport=tcp",
        "turns:jb-turn1.xirsys.com:5349?transport=tcp"
    ],
    username: 'ManOPUSl4xA9HeLfuZjCP9TJ6uFox7J-ZiMjxHOhiPrXNp6yvnyLIbFRbvIfBLmlAAAAAGeSDOVzcGxhbm5lcw==',
    credential: '18a4330a-d96d-11ef-8f1f-0242ac120004'
}];

// Get the local media (audio)
function getUserMedia() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            localStream = stream;
            const localVideo = document.getElementById('local-video');
            localVideo.srcObject = stream;
        })
        .catch(error => {
            console.error("Error accessing media devices:", error);
        });
}

// Create the peer connection
function createPeerConnection() {
    peerConnection = new RTCPeerConnection({ iceServers });

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate);
        }
    };

    peerConnection.ontrack = (event) => {
        remoteStream = event.streams[0];
        const remoteVideo = document.getElementById('remote-video');
        remoteVideo.srcObject = remoteStream;
    };

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
}

// Send the offer to start the call
function startCall() {
    createPeerConnection();

    peerConnection.createOffer()
        .then(offer => {
            return peerConnection.setLocalDescription(offer);
        })
        .then(() => {
            socket.emit('offer', peerConnection.localDescription);
        })
        .catch(error => {
            console.error("Error creating offer:", error);
        });
}

// Receive the answer to the call
function receiveAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

// Handle ICE candidates
socket.on('ice-candidate', candidate => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Handle incoming offer
socket.on('offer', offer => {
    if (!isCallActive) {
        createPeerConnection();
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
            .then(() => {
                return peerConnection.createAnswer();
            })
            .then(answer => {
                return peerConnection.setLocalDescription(answer);
            })
            .then(() => {
                socket.emit('answer', peerConnection.localDescription);
            })
            .catch(error => {
                console.error("Error handling offer:", error);
            });
    }
});

// Handle incoming answer
socket.on('answer', answer => {
    receiveAnswer(answer);
});

// Handle call initiation and ending
document.getElementById('startCallBtn').addEventListener('click', () => {
    startCall();
    document.getElementById('startCallBtn').style.display = 'none';
    document.getElementById('endCallBtn').style.display = 'inline-block';
});

document.getElementById('endCallBtn').addEventListener('click', () => {
    peerConnection.close();
    localStream.getTracks().forEach(track => track.stop());
    document.getElementById('startCallBtn').style.display = 'inline-block';
    document.getElementById('endCallBtn').style.display = 'none';
    document.getElementById('local-video').innerHTML = '';
    document.getElementById('remote-video').innerHTML = '';
});

getUserMedia();