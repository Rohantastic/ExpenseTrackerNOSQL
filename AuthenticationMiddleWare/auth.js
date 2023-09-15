const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate users
exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization'); 

        if (!token) {
            return res.status(401).json({ error: 'Authorization token missing' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);

        // Find the user in the database based on the decoded token
        const user = await User.findById(decodedToken.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach the user object to the request
        req.user = user;
        console.log('>>>>auth success moving to controller with his id', req.user);
        next();
    } catch (err) {
        console.error('Error in authentication middleware:', err);
        return res.status(500).json({ error: 'Something went wrong in authenticating' });
    }
};
