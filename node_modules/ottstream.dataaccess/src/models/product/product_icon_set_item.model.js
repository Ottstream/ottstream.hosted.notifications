const mongoose = require('mongoose');
const { toJSON } = require('../plugins');

const { Schema } = mongoose;

const productIconSetItemSchema = mongoose.Schema(
  {
    data: {
      type: Schema.Types.Mixed,
      required: false,
    },
    originalImage: { type: Schema.Types.ObjectId, ref: 'File', required: false },
    changedImage: { type: Schema.Types.ObjectId, ref: 'File', required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productIconSetItemSchema.plugin(toJSON);

/**
 * @typedef productSchema
 */

module.exports = productIconSetItemSchema;
