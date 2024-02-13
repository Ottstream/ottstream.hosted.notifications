const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

const { Schema } = mongoose;

const currencyCountry = mongoose.Schema(
  {
    name: [translationSchema],
    currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
    country: { type: Schema.Types.ObjectId, ref: 'Country' },
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
currencyCountry.plugin(toJSON);
currencyCountry.plugin(paginate);

/**
 * @typedef package
 */
// const currencyCountrySchema = mongoose.model('CurrencyCountry', currencyCountry, 'currency_countries');
//
// module.exports = currencyCountrySchema;
