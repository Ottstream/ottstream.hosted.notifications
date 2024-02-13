const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const productPriceItemSchema = mongoose.Schema(
  {
    piece: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
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
productPriceItemSchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

module.exports = productPriceItemSchema;
