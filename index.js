const express = require('express');
const dbConnection = require('./models/db'); // Import database connection
const User = require('./models/user.model'); // Import user model
const Reservation = require('./models/reservation.model'); // Import reservation model
const Hotel = require('./models/hotel.model'); // Import hotel model
const Room = require('./models/room.model'); // Import room model
const Meal = require('./models/meal.model'); // Import meal model
const Service = require('./models/service.model'); // Import services model

const path = require('path');
const bcrypt = require('bcrypt'); // For password hashing
const app = express();
const jwt = require('jsonwebtoken');

// const nanoid = require('nanoid');
const port = process.env.PORT || 3000; // Use environment variable for port


// Connect to MongoDB database
dbConnection();

// Parse incoming JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'pages')));

//System user info
let sysUser;

const signup = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate user input (omitted for brevity)

      const newUser = new User({
        username,
        password: password,
        role: role || 'user', // Set default role to 'user' if not provided
      });
      await newUser.save();
      sysUser = newUser;

    return res.status(201).json({ message: 'User created successfully!' }); // Avoid sending sensitive data like password in response
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating user' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials user not found' });     
    }
    
    await bcrypt.compare(password, user.password, (err, isMatch) => {
      console.log(err, isMatch);
      if (err) 
        return err;
      
      else if (!isMatch){
        return res.status(401).json({ message: 'Invalid credentials password is incorrect' });
      }
      else{
        sysUser = user;
        return res.status(200).json({ message: 'Login successful!'});
      }

    });

    // Generate JWT on successful login
    // const payload = { userId: user._id };
    // const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });  
    // res.status(200).json({ message: 'Login successful!', token });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error logging in' });
   
  }
};


const reservations = async (req, res) => {
  
  const reservations = await Reservation.find();
  return res.json({ reservations});  
  

};

async function addReservation(req, res) {
  try {
    userId = sysUser._id;
    const {
      name,
      phoneNumber,
      startDate,
      endDate,
      numAdults,
      numChildren,
      numMeals,
      rooms,
      services,
    } = req.body;

    // Basic validation
    if (!userId || !name || !phoneNumber || !startDate || !endDate || !numAdults || !numChildren || !numMeals || !rooms.length || !services.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Additional validation (optional)
    if (Date.parse(startDate) >= Date.parse(endDate)) {
      return res.status(400).json({ message: 'Invalid date range. Start date must be before end date' });
    }

    if (numAdults <= 0 || numChildren < 0 || numMeals < 0) {
      return res.status(400).json({ message: 'Invalid values for number of adults, children, or meals' });
    }

    // Validate room availability (assuming a Room model exists)
    const unavailableRooms = await Room.find({
      _id: { $in: rooms.map((room) => room.roomId) },
      booked: { $elemMatch: { startDate: { $lte: endDate }, endDate: { $gte: startDate } } },
    });

    if (unavailableRooms.length > 0) {
      return res.status(400).json({ message: 'Selected rooms are unavailable during the requested dates' });
    }

    // Calculate total price based on room and service prices (assuming price fields in models)
    let totalPrice = 0;
    for (const room of rooms) {
      const roomData = await Room.findById(room.roomId);
      totalPrice += roomData.price * (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24); // Calculate price based on date difference
    }
    for (const service of services) {
      const serviceData = await Service.findById(service.serviceId);
      totalPrice += serviceData.price * service.quantity;
    }

    // Create reservation document
    const newReservation = new Reservation({
      userId,
      name,
      phoneNumber,
      startDate,
      endDate,
      numAdults,
      numChildren,
      numMeals,
      rooms,
      services,
      totalPrice,
      status: 'Confirmed', // Or set an initial status based on your workflow
    });

    const savedReservation = await newReservation.save();

    res.status(201).json({ message: 'Reservation created successfully!', reservation: savedReservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating reservation' });
  }
}


async function createRoom(req, res) {
  try {
    const { hotelId, type, capacity, description, price } = req.body;

    // Basic validation
    if (!hotelId || !type || !description || !capacity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate hotel existence (assuming a Hotel model exists)
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Additional validation (optional)
    if (price <= 0) {
      return res.status(400).json({ message: 'Invalid price. Price must be positive' });
    }

    // Create room document
    const newRoom = new Room({
      hotelId,
      type,
      description,
      capacity,
      price,
    });

    const savedRoom = await newRoom.save();

    res.status(201).json({ message: 'Room created successfully!', room: savedRoom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating room' });
  }
}

async function addMeal(req, res) {
  try {
    const { name, description, price } = req.body;

    // Basic validation
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Additional validation (optional)
    if (price <= 0) {
      return res.status(400).json({ message: 'Invalid price. Price must be positive' });
    }

    // Create meal document
    const newMeal = new Meal({
      name,
      description,
      price,
    });

    const savedMeal = await newMeal.save();

    res.status(201).json({ message: 'Meal created successfully!', meal: savedMeal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating meal' });
  }
}

async function addService(req, res) {
  try {
    const { name, description, price } = req.body;

    // Basic validation
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Additional validation (optional)
    if (price <= 0) {
      return res.status(400).json({ message: 'Invalid price. Price must be positive' });
    }

    // Create service document
    const newService = new Service({
      name,
      description,
      price,
    });

    const savedService = await newService.save();

    res.status(201).json({ message: 'Service created successfully!', service: savedService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating service' });
  }
}
// End Points
//=================================================================
//User Endpoints 
app.post('/users/signup', signup);
app.post('/users/login', login);

//=================================================================
//Reservation Endpoints 
app.post('/reservation', reservations);
app.post('/reservation/create', addReservation);
// app.post('/reservation/delete', deleteReservation);
// app.post('/reservation/edit', editReservation);

//================================================================
//Room Endpoints
app.post('/room/create', createRoom);
// app.post('/room/edit', editRoom);
// app.post('/room/delete', deleteRoom);

//================================================================
//Meals Endpoints
app.post('/meal/create', addMeal)

//================================================================
//Hotel Endpoints
app.post('/hotel/create', async (req, res) => {
  const {name, description} = req.body;
  const newHotel = new Hotel({name, description});
  await newHotel.save();
})

//================================================================
//Services Endpoints
app.post('/service/create', addService);

// Add additional API endpoints for functionalities like retrieving users, reservations, etc.
app.listen(port, () => {
  console.log(`Server is running localhost:${port}`);
});

