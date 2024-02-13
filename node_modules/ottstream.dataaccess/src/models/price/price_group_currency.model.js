const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const priceGroupCurrencySchema = mongoose.Schema(
  {
    currency: {
      type: String,
      required: true,
    },
    country: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
priceGroupCurrencySchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

module.exports = priceGroupCurrencySchema;
