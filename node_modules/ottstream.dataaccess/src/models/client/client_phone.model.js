const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const clientPhoneSchema = mongoose.Schema(
  {
    phone: {
      type: String,
      required: false,
      trim: false,
      index: true,
    },
    code: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    forCall: {
      type: Boolean,
      required: false,
      default: true,
    },
    forMessages: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientPhoneSchema.plugin(toJSON);

module.exports = clientPhoneSchema;
