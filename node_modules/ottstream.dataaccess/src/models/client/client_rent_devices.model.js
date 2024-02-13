const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const clientDeviceSchema = mongoose.Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    interval: {
      type: String,
      required: false,
    },
    count: {
      type: Number,
      required: true,
    },
    expireDtae: {
      type: Date,
      required: false,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
clientDeviceSchema.plugin(toJSON);

/**
 * @typedef channelSchema
 */

module.exports = clientDeviceSchema;
