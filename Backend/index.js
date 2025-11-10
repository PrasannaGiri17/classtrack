const express = require('express');
const connectDB = require('./database');
const app = express();
const port = 7000;
const cors = require('cors'); // Import cors
app.use(express.json());  
const studentRoutes = require('./routes/studentRoutes');
app.use(cors()); // Use cors middleware
app.use('/students', studentRoutes);



app.get('/', (req, res) => {
    res.send('Hello from the Backend server!');
});


app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
connectDB();
