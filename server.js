const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const sequelize = require("./config/dbConf");
require('dotenv').config();

// Import Routes
const authenticateJWT = require('./routes/authRoute');
const loginRouter = require("./routes/loginRoute");
const loginWithGoogle = require("./routes/loginWithGoogle");
const postRouter = require("./routes/userPostRoute");
const commentRouter = require("./routes/commentRoute");
const deletePostRoute = require("./routes/deletePostRoute");
const likesRoute = require("./routes/likesRoute");
const adminRouter = require("./routes/adminRoute");
const userRouter = require("./routes/userRoute");
const profileRouter = require("./routes/userProfileRoute");
const apiRouter = require("./routes/apiRoute");
const adminC = require("./routes/adminPostTocard");
const adminD = require("./routes/adminDeleteRoute");
const setupSocket = require("./controllers/socketHandler");
const setupClassSocket = require("./controllers/classSocketHandler");
const updateStatusRoute = require("./routes/updateStatusRoute");
const enrollmentRouter = require('./routes/enrollmentRouter')
const feedbackRoutes = require('./routes/feedbackRoute');
const getFeedBack = require('./routes/getFeedBack');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const files = []
    // Middleware Setup
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'mySuperSecretKey123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
}));

// Serve Static Files
app.use(express.static("views"));
app.use(express.static("uploads"));
app.use(express.static("audio"));
// pulic routes 
app.get("/policy", (req, res) => res.sendFile(path.join(__dirname, "views", "policy.html")))
app.get("/about", (req, res) => res.sendFile(path.join(__dirname, "views", "about.html")));
app.get("/contact", (req, res) => res.sendFile(path.join(__dirname, "views", "contact.html")));
app.get("/faq", (req, res) => res.sendFile(path.join(__dirname, "views", "faq.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "views", "index1.html")));
app.get("/index1", (req, res) => res.sendFile(path.join(__dirname, "views", "index1.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "views", "signup.html")));
app.get("/terms", (req, res) => res.sendFile(path.join(__dirname, "views", "terms.html")));
app.get("/notadmin", (req, res) => res.sendFile(path.join(__dirname, "views", "notadmin.html")));

app.get("/terms-privacy", (req, res) => res.sendFile(path.join(__dirname, "views", "terms-privacy.html")));
app.get("/notlogedin", (req, res) => res.sendFile(path.join(__dirname, "views", "notlogedin.html")));
// Login Route
app.use("/login", loginRouter);
//protected routes
app.get("/advert", authenticateJWT, (req, res) => res.sendFile(path.join(__dirname, "views", "advert.html")));
app.get("/home", (req, res) => res.sendFile(path.join(__dirname, "views", "homepage.html")));
app.get("/homepage", authenticateJWT, (req, res) => res.sendFile(path.join(__dirname, "views", "homepage.html")));
app.get("/profile", (req, res) => res.sendFile(path.join(__dirname, "views", "profile.html")));
app.get("/advertisements", authenticateJWT, (req, res) => res.sendFile(path.join(__dirname, "views", "advert.html")));
app.get("/realtime-editor", authenticateJWT, (req, res) => res.sendFile(path.join(__dirname, "views", "realtime-editor.html")));
app.get("/pdfy", authenticateJWT, (req, res) => res.sendFile(path.join(__dirname, "views", "pdfy.html")));

app.get("/auth/admin//", authenticateJWT, (req, res) => res.sendFile(path.join(__dirname, "views", "adminPage.html")));
app.get("/viewPost", authenticateJWT, (req, res) => res.sendFile(path.join(__dirname, "views", "viewPost.html")));
app.get("/auth/admin", authenticateJWT, (req, res) => res.sendFile(path.join(__dirname, "views", "advertByAdmin.html")));
//app.get("/advertByAdmin", authenticateJWT, (req, res) => res.sendFile(path.join(__dirname, "views", "notadmin.html")));


// File Upload Route
const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = `/uploads/${req.file.filename}`;
    const groupName = req.body.groupName;
    if (!files[groupName]) files[groupName] = [];
    files[groupName].push(filePath);
    io.to(groupName).emit("new-file", { filePath });
    res.json({ filePath });
});

// Additional Routes
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/delete", deletePostRoute);
app.use("/likes", likesRoute);
app.use("/admin", adminRouter);
app.use("/adminCard", adminC);
app.use("/adminDelete", adminD);
app.use("/users", userRouter);
app.use("/profile", profileRouter);
app.use('/feedback', feedbackRoutes);
app.use("/api/users", updateStatusRoute);
app.use('/api/verify-payment', enrollmentRouter)
app.use('/login-google', loginWithGoogle)
app.use("/api", apiRouter);
app.use("/gfeedback", getFeedBack);
// Database Initialization
sequelize.authenticate()
    .then(() => console.log("Database connected!"))
    .catch((err) => console.error("Database connection failed:", err));

sequelize.sync({ force: false})
    .then(() => console.log("Database synced successfully."))
    .catch((err) => console.error("Database sync failed:", err));

// Setup Socket Communication
setupSocket(server);
setupClassSocket(server);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start the Server
const port = process.env.PORT || 10000;
server.listen(port, () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});
