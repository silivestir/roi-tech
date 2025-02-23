// Setup Socket for File Uploads & WebRTC
const setupPdfFunction = (server) => {
    const ioo = socketIo(server);

    ioo.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        let groupName = null;

        socket.on("join-group", (group) => {
            groupName = group;
            if (!users[groupName]) {
                users[groupName] = [];
            }
            users[groupName].push(socket.id);
            socket.join(groupName);
            console.log(`${socket.id} joined group: ${groupName}`);
        });

        socket.on("file-clicked", (data) => {
            console.log(`File clicked: ${data.filePath}`);
            ioo.to(groupName).emit("alert-file", data.filePath);
        });

        socket.on("drawing", (data) => {
            socket.to(groupName).emit("drawing", data);
        });

        socket.on("webrtc-offer", (data) => {
            socket.to(data.peerId).emit("webrtc-offer", data);
        });

        socket.on("webrtc-answer", (data) => {
            socket.to(data.peerId).emit("webrtc-answer", data);
        });

        socket.on("new-peer", (peerId) => {
            socket.to(peerId).emit("new-peer", socket.id);
        });

        socket.on("disconnect", () => {
            if (groupName) {
                const index = users[groupName].indexOf(socket.id);
                if (index !== -1) {
                    users[groupName].splice(index, 1);
                }
                console.log(`${socket.id} disconnected from group: ${groupName}`);
            }
        });
    });

    const uploadRoute = express.Router();

    // Handling file upload
    app.post("/upload", upload.single("file"), (req, res) => {
        const filePath = `/uploads/${req.file.filename}`;
        const groupName = req.body.groupName;

        if (!files[groupName]) {
            files[groupName] = [];
        }

        files[groupName].push(filePath);
        ioo.to(groupName).emit("new-file", { filePath });

        res.json({ filePath });
    });

    return uploadRoute;
};