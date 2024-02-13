const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const packagePriceItemSchema = mongoose.Schema(
  {
    room: {
      type: Number,
      required: true,
    },
    interval: {
      type: Number,
      required: true,
    },
    intervalType: {
      type: String,
      enum: ['m', 'd'],
      required: true,
    },
    price: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
packagePriceItemSchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

module.exports = packagePriceItemSchema;
