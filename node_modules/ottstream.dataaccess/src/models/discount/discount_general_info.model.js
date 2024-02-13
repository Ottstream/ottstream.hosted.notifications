const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const discountGeneralInfo = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    type: {
      type: Number,
      required: false,
      enum: [1, 2, 3], // all, for client, for provider
    },
    status: {
      type: Number,
      required: false,
      enum: [1, 2, 3], // all, disabled, enabled
    },
    rounding: {
      type: String,
      required: false,
    },
    sendNotifications: {
      type: Boolean,
      required: false,
      default: false,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    endDate: {
      type: Date,
      required: false,
      default: Date.now(),
    },
    countriesAccepted: [
      {
        type: String,
        required: false,
      },
    ],
    countriesDenied: [
      {
        type: String,
        required: false,
      },
    ],
    defaultSalePercent: {
      type: Number,
      required: false,
    },
    digits: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
discountGeneralInfo.plugin(toJSON);

module.exports = discountGeneralInfo;
