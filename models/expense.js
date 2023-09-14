const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expense: Number,
  category: String,
  description: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  }
},{
  timestamps: {
    currentTime: () => {
      return new Date().toISOString(); 
    },
  } 
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
