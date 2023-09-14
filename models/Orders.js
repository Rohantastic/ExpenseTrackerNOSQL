const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  paymentid: String,
  orderid: String,
  status: String
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
