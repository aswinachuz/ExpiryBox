const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  relation: {
    type: String,
    default: 'Self',
    trim: true,
  },
  avatar: {
    type: String,
    default: '👤',
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Person', PersonSchema);
