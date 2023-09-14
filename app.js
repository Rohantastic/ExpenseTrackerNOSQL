const express = require('express');
const fs = require('fs');
const app = express();
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const UserRoute = require('./routes/User');
const ExpenseRoute = require('./routes/expense');
const PurchaseRoute = require('./routes/purchase');
const PremiumRoute = require('./routes/premium');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const db = require('./config/database'); // Import your database configuration

// Import your models
const User = require('./models/User');
const ExpenseModel = require('./models/expense'); // Import the Expense model
const OrderModel = require('./models/Orders');
const PasswordRequestModel = require('./models/ForgotPasswordRequests');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use('/user', UserRoute);
app.use('/expense', ExpenseRoute);
app.use('/purchase', PurchaseRoute);
app.use('/premium', PremiumRoute);
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

// Define MongoDB relations - Mongoose style
const ExpenseSchema = new mongoose.Schema({
    // Expense schema fields here
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Start the Express app
const port = process.env.PORT || 3000;

app.listen(port, (err) => {
    if (err) {
        console.error('Error starting the server:', err);
    } else {
        console.log('Server Initialized...');
    }
});
