const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Vehicle', 'Electronics', 'Home Appliance', 'Banking & Finance', 'Real Estate', 'Identity & Legal', 'Other'],
    default: 'Other',
  },
  identifier: {
    type: String, // Registration No, Serial Number, IMEI, Account number
    trim: true,
    default: '',
  },
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
  },
  personName: {
    type: String,
    default: '',
  },
  metadata: {
    brand: String,
    model: String,
    purchaseDate: Date,
    odometerKm: Number,
    technicianContact: String,
    notes: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Asset', AssetSchema);
