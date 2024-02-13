const mongoose = require('mongoose');
const { toJSON } = require('../plugins');
const productPriceItemSchema = require('./product_price_item.model');

const { Schema } = mongoose;

const productPriceSchema = mongoose.Schema(
  {
    discount: {
      type: Schema.Types.ObjectId,
      ref: 'Discount',
    },
    type: {
      type: Number,
      required: false,
    },
    saleType: {
      type: Number,
      required: false,
    },
    tax: {
      type: String,
      required: false,
      default: '',
    },
    currencyCountry: {
      type: Schema.Types.ObjectId,
      ref: 'CurrencyCountry',
    },
    priceGroup: {
      type: Schema.Types.ObjectId,
      ref: 'PriceGroup',
      required: true,
    },
    priceItems: [productPriceItemSchema],
    intervals: [{ type: String }],
    pieces: [{ type: Number }],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productPriceSchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

module.exports = productPriceSchema;
