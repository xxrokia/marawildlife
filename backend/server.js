const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 4000;
const mongoURI = 'mongodb://localhost:27017/maasai_mara';

// MongoDB Schemas
const Animal = mongoose.model('Animal', {
  species: String,
  age: Number,
  latitude: Number,
  longitude: Number,
  speed: Number,
  distance_traveled: Number
});

const Statistics = mongoose.model('Statistics', {
  totalDistance: Number,
  averageSpeed: Number,
  totalAnimals: Number
});

const Terrain = mongoose.model('Terrain', {
  type: String,
  latitude: Number,
  longitude: Number
});

const Weather = mongoose.model('Weather', {
  condition: String,
  temperature: Number,
  latitude: Number,
  longitude: Number
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.get('/animals', async (req, res) => {
  try {
    const animals = await Animal.find();
    res.json(animals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
