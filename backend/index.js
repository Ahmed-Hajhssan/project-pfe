const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()



// Connecting with mongo db
mongoose
  .connect('mongodb://localhost:27017/Project')
  .then((x) => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch((err) => {
    console.error('Error connecting to mongo', err.reason)
  })
// Setting up port with express js
const userRoute = require('./routes/user.route')
const entrepreneurRoute = require('./routes/entrepreneur.route')
const investorRoute = require('./routes/investor.route')


app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
)
app.use(cors())
app.use(express.static(path.join(__dirname, "uploads"), { maxage: "864000" }));

app.use('/api', entrepreneurRoute)
app.use('', userRoute)
app.use('/investor', investorRoute)

// Create port
const port = process.env.PORT || 4000
const server = app.listen(port, () => {
  console.log('Connected to port ' + port)
})

const http = require("http");
const socketIO = require("socket.io");
const server2 = http.createServer(app);
const io = socketIO(server2, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  socket.on("message", (message) => {
    console.log("Received message: " + message);
    io.emit("message", message); // Emit the message to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

const port2 = process.env.PORT || 3000;
server2.listen(port2, () => {
  console.log(`Server started on port ${port2}`);
});



// Find 404 and hand over to error handler
app.use((req, res, next) => {
  next(createError(404))
})
// error handler
app.use(function (err, req, res, next) {
  console.error(err.message) // Log error message in our server's console
  if (!err.statusCode) err.statusCode = 500 // If err has no specified error code, set error code to 'Internal Server Error (500)'
  res.status(err.statusCode).send(err.message) // All HTTP requests must have a response, so let's send back an error with its status code and message
})