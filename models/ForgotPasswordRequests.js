const mongoose = require('mongoose');

const passwordRequestSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  active: Boolean
},{
  timestamps: true, 
});

const PasswordRequest = mongoose.model('PasswordRequest', passwordRequestSchema);

module.exports = PasswordRequest;
