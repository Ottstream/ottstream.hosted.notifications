const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const productOptions = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      required: false,
    },
    isDefault: {
      type: Boolean,
      required: false,
      default: false,
    },
    stock: {
      type: Number,
      required: false,
      default: 0,
    },
    state: {
      type: Number,
      required: false,
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
productOptions.plugin(toJSON);

/**
 * @typedef package
 */

module.exports = productOptions;
