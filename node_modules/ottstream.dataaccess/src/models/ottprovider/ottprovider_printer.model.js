const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');

const { Schema } = mongoose;

const printerSchema = mongoose.Schema(
  {
    isShipping: {
      type: Boolean,
      required: true,
    },
    ip: {
      type: String,
      required: false,
    },
    port: {
      type: Number,
      required: false,
    },
    model: {
      type: String,
      required: false,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'OttProviderAddress',
    },
    pagesPerSheet: {
      type: Number,
      required: false,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'OttProvider',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
printerSchema.plugin(toJSON);
printerSchema.plugin(paginate);

/**
 * @typedef ottproviderSchema
 */
const OttProviderPrinter = mongoose.model('OttProviderPrinter', printerSchema, 'ottprovider_printers');
/**
 * @typedef printerSchema
 */

module.exports = OttProviderPrinter;
