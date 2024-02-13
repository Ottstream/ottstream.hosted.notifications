const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const clientEmailSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    isMain: {
      type: Boolean,
      required: false,
      default: false,
    },
    forContactInvoice: {
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
clientEmailSchema.plugin(toJSON);

module.exports = clientEmailSchema;
