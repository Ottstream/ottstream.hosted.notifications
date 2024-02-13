const mongoose = require('mongoose');
const { toJSON } = require('../plugins');
const packagePriceItemSchema = require('./package_price_item.model');

const { Schema } = mongoose;

const packagePriceSchema = mongoose.Schema(
  {
    priceGroup: {
      type: Schema.Types.ObjectId,
      ref: 'PriceGroup',
    },
    discount: {
      type: Schema.Types.ObjectId,
      ref: 'Discount',
    },
    percent: {
      type: Number,
    },
    clientType: {
      type: Boolean,
      required: true,
      default: true,
    },
    priceItems: [packagePriceItemSchema],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
packagePriceSchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

module.exports = packagePriceSchema;
