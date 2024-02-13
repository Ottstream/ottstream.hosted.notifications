const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const clientSettingsTableSchema = mongoose.Schema(
  {
    location: [
      {
        type: String,
        required: false,
        trim: false,
      },
    ],
    timezone: [
      {
        type: String,
        required: false,
      },
    ],
    roomsCount: [
      {
        type: Number,
        required: false,
      },
    ],
    login: [
      {
        type: String,
        required: false,
        trim: true,
      },
    ],
    server: [
      {
        type: String,
        required: false,
        default: 'Server01',
      },
    ],
    expireDate: [
      {
        type: Date,
        required: false,
        default: Date.now,
      },
    ],
    isBlockLocation: [
      {
        type: Boolean,
        required: true,
        default: false,
      },
    ],
    isPauseSubscriptions: [
      {
        type: Boolean,
        required: false,
        default: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientSettingsTableSchema.plugin(toJSON);

module.exports = clientSettingsTableSchema;
