To create a simple **voice call app** using **PeerJS**, **Express**, **HTML**, and your **Metered ICE credentials** (STUN/TURN), you'll need to follow these steps:

### High-level flow:
1. **Set up an Express server** to handle signaling.
2. **Set up PeerJS** on the server and on the client.
3. **Integrate your ICE credentials (STUN/TURN)** into the PeerJS configuration.
4. **Create the frontend HTML** for the voice call UI.
5. **Handle the signaling process** to exchange connection information.

### 1. **Set up the Express server:**

First, let's create a basic **Express** server to handle HTTP requests, including serving the client-side HTML and handling WebSocket signaling.

#### Install dependencies:
```bash
npm init -y
npm install express peer
```

Create a file called `server.js`:

```javascript
const express = require('express');
const { PeerServer } = require('peer');
const app = express();
const port = 3000;

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static('public'));

// Start PeerJS server
const peerServer = PeerServer({
  port: 9000,
  path: '/peerjs',
  ssl: { key: 'path/to/your/ssl-key', cert: 'path/to/your/ssl-cert' }, // optional SSL configuration
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
```

This sets up a basic Express server that serves static files and runs a PeerJS server on port 9000 for peer-to-peer communication.

### 2. **Integrate ICE credentials in PeerJS:**

You mentioned having **Metered ICE credentials**, which you will use for STUN/TURN servers to enable NAT traversal.

Add the **ICE servers** to the PeerJS configuration when creating a new Peer in the client-side JavaScript.

```javascript
const peer = new Peer('peer-id', {
  config: {
    iceServers: [
      {
        urls: 'stun:your.stun.server', // Replace with your STUN server URL
      },
      {
        urls: 'turn:your.turn.server', // Replace with your TURN server URL
        username: 'your-username', // Replace with your TURN server username
        credential: 'your-credential', // Replace with your TURN server credential
      },
    ],
  },
});
```

### 3. **Create the Frontend (HTML + JavaScript):**

Create a folder named `public/` and inside it, create an `index.html` file.

#### `index.html` (Simple voice call UI):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PeerJS Voice Call</title>
</head>
<body>
    <h1>Voice Call</h1>

    <!-- Call buttons -->
    <button id="callButton">Call</button>
    <button id="endCallButton" disabled>End Call</button>

    <div>
        <h2>Remote Audio:</h2>
        <audio id="remoteAudio" autoplay></audio>
    </div>

    <div>
        <h2>Your Audio:</h2>
        <audio id="localAudio" autoplay muted></audio>
    </div>

    <script src="https://cdn.peerjs.com/peerjs.min.js"></script>
    <script>
        // Initialize peer connection
        const peer = new Peer(undefined, {
            config: {
                iceServers: [
                    { urls: 'stun:your.stun.server' }, // Replace with your STUN server URL
                    { urls: 'turn:your.turn.server', username: 'your-username', credential: 'your-credential' },
                ]
            }
        });

        const callButton = document.getElementById('callButton');
        const endCallButton = document.getElementById('endCallButton');
        const localAudio = document.getElementById('localAudio');
        const remoteAudio = document.getElementById('remoteAudio');

        let localStream;
        let currentCall;

        // Get user's media (audio)
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                localAudio.srcObject = stream;
                localStream = stream;
            })
            .catch(error => console.error('Error accessing media devices.', error));

        // Call button click event
        callButton.addEventListener('click', () => {
            const peerIdToCall = prompt('Enter peer ID to call:');
            if (peerIdToCall) {
                // Initiate the call
                const call = peer.call(peerIdToCall, localStream);
                handleCall(call);
            }
        });

        // Handle incoming call
        peer.on('call', incomingCall => {
            const acceptCall = confirm('Incoming call. Accept?');
            if (acceptCall) {
                incomingCall.answer(localStream);
                handleCall(incomingCall);
            }
        });

        // Handle call (set up stream and buttons)
        function handleCall(call) {
            currentCall = call;

            // On stream from remote peer, play the remote audio
            call.on('stream', remoteStream => {
                remoteAudio.srcObject = remoteStream;
            });

            // Enable the end call button
            endCallButton.disabled = false;

            // Handle end call
            endCallButton.addEventListener('click', () => {
                call.close();
                endCallButton.disabled = true;
                remoteAudio.srcObject = null;
                localAudio.srcObject = null;
            });
        }

        // Handle peer errors
        peer.on('error', (err) => {
            alert(err);
        });
    </script>
</body>
</html>
```

### 4. **Run your application:**

To run your app, execute the following in the terminal:

```bash
node server.js
```

This will start the Express server and the PeerJS server. Open the browser and navigate to `http://localhost:3000/`. 

### How the app works:
- The **user** accesses the app, which asks for their media stream (audio).
- When the **Call** button is pressed, the app prompts the user for a peer ID and makes a call.
- When another user connects, they can accept the call. Audio streams from both ends are handled using WebRTC.
- **ICE credentials** are configured to help peers establish connections even if they are behind firewalls or NATs.

### Key points:
- Replace the `stun` and `turn` server URLs, along with `username` and `credential`, with your actual **Metered ICE credentials**.
- This is a basic implementation, and for production, you'll want to handle better error management, peer connection state management, and possibly encryption/SSL for security.

Let me know if you need further help or adjustments to the code!