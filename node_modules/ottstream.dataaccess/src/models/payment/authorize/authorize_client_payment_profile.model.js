const mongoose = require('mongoose');

const authorizeClientPaymentProfileSchema = mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

module.exports = authorizeClientPaymentProfileSchema;
