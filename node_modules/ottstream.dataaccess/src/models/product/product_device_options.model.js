const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const productDeviceOptions = mongoose.Schema(
  {
    dimension: {
      type: String,
      required: false,
    },
    dimensionUnit: {
      type: String,
      required: false,
    },
    weight: {
      type: String,
      required: false,
    },
    weightUnit: {
      type: String,
      required: false,
    },
    boxDimension: {
      type: String,
      required: false,
    },
    boxDimensionUnit: {
      type: String,
      required: false,
    },
    boxWeight: {
      type: String,
      required: false,
    },
    boxWeightUnit: {
      type: String,
      required: false,
    },
    manufacturer: {
      type: String,
      required: false,
    },
    certification: {
      type: String,
      required: false,
    },
    condition: {
      type: String,
      required: false,
    },
    standard: {
      type: String,
      required: false,
    },
    os: {
      type: String,
      required: false,
    },
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
productDeviceOptions.plugin(toJSON);

/**
 * @typedef package
 */

module.exports = productDeviceOptions;
