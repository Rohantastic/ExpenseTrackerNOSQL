const Razorpay = require('razorpay');
const Order = require('../models/Orders');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

function generateAccessToken(id, ispremiumuser, name) {
  return jwt.sign({ userId: id, ispremiumuser, name }, process.env.JWT_TOKEN); // Secret key
}

exports.purchasePremium = (req, res, next) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const amount = 2500;

    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      if (err) {
        throw new Error(err);
      }

      const newOrder = new Order({ paymentid: order.id, status: 'PENDING', userId: req.user._id });
      const savedOrder = await newOrder.save();

      if (savedOrder) {
        return res.status(201).json({ order, key_id: rzp.key_id });
      }
    });
  } catch (err) {
    console.log('Error in purchasePremium controller');
    res.status(500).json({ error: err, message: "Something went wrong" });
  }
};

exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { payment_id, order_id } = req.body;

    const order = await Order.findOne({ paymentid: order_id });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const promises = [];

    // Update the order's payment status
    promises.push(Order.updateOne({ paymentid: order_id }, { status: 'SUCCESSFUL' }));

    // Get the user and update the premium status
    const user = await User.findById(req.user._id);

    console.log('user in purchace premium before updating>>> ', user);
    // if (user) {
      promises.push(User.updateOne({ name: user.name }, { ispremiumuser: true })); //PROBLEM LIES HERE, ispremiumuser is not setting TRUE
      user.ispremiumuser = true;
    //}
    console.log('user in purchace premium after updating>>> ', user);
    // Wait for both updates to complete
    await Promise.all(promises);

    // Generate an updated access token
    const updatedToken = generateAccessToken(user._id, user.ispremiumuser, user.name);

    console.log('>>>>updated token>>>', updatedToken);
    return res.status(202).json({ success: true, message: "Transaction Successful", ispremiumuser: true, token: updatedToken });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err, message: "Something went wrong in updateTransaction" });
  }
};
