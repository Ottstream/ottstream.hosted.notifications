const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const translationSchema = require('../translation.model');

const { Schema } = mongoose;

const currency = mongoose.Schema(
  {
    name: [translationSchema],
    code: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: Number,
      required: true,
      default: 1,
    },
    provider: { type: Schema.Types.ObjectId, ref: 'OttProvider' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
currency.plugin(toJSON);
currency.plugin(paginate);

/**
 * @typedef package
 */
const currencySchema = mongoose.model('Currency', currency, 'currencies');

module.exports = currencySchema;
