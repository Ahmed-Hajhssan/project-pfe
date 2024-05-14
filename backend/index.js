const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()

let Chat = require('./models/Chat');


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


io.on('connection', (socket) => {
  const senderId = socket.handshake.query.senderId;
  const receiverId = socket.handshake.query.receiverId;
  const room = socket.handshake.query.roomName;

  socket.join(room)
  socket.id = senderId;
  console.log(senderId+' connected to room: "' + room+'"');

  socket.on('sendMessage', async (data) => {
    console.log('Received message: ' + data.message);
    // Save the message to MongoDB
    try {
      const newchat = new Chat({
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
        timestamp: Date(),
      });
      await newchat.save();
      console.log('Message saved to MongoDB.');
      // Emit the message to the appropriate users
      io.to(room).emit('message', newchat);
    } catch (error) {
      console.error('Error saving message to MongoDB:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
  });
  // Handle receiving messages
  socket.on('requestMessages', async (data) => {
    const { userId, otherUserId } = data;
    try {
      const messages = await Chat.find({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      }).exec();
      socket.emit('requestedMessages', messages);
      
    } catch (error) {
      console.error('Error retrieving messages:', error);
    }
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