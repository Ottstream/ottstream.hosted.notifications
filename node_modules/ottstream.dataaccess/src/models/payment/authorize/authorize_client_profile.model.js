const mongoose = require('mongoose');
const authorizeClientPaymentProfileSchema = require('./authorize_client_payment_profile.model');

const authorizeClientProfileSchema = mongoose.Schema(
  {
    profileId: {
      type: String,
      required: true,
    },
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    paymentProfiles: [authorizeClientPaymentProfileSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = authorizeClientProfileSchema;
