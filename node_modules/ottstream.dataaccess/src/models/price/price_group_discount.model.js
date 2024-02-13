const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const priceGroupDiscountSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
priceGroupDiscountSchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

module.exports = priceGroupDiscountSchema;
